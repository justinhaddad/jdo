import dateparser
import datetime
from datetime import datetime as dt
import falcon
from functools import reduce
import json
import logging
import operator
from peewee import IntegrityError
from playhouse.shortcuts import model_to_dict
import re
import sys
from wsgiref import simple_server

import models
from models import Todo, SnoozeAll, TodoList
from constants import REPEATS

logging.basicConfig(level=logging.DEBUG)
DEFAULT_LIST = 'Reminders';
count = 0
models.connect()


def get_module_logger(mod_name):
    """
    To use this, do logger = get_module_logger(__name__)
    """
    logger = logging.getLogger(mod_name)
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s [%(name)-12s] %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)
    return logger


log = get_module_logger(__name__)


class Encoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, dt):
            return obj.isoformat()
        elif isinstance(obj, datetime.date):
            return obj.isoformat()
        elif isinstance(obj, datetime.timedelta):
            return (datetime.datetime.min + obj).time().isoformat()
        else:
            return super(Encoder, self).default(obj)


class CORSComponent(object):
    def process_response(self, req, resp, resource, req_succeeded):
        resp.set_header('Access-Control-Allow-Origin', '*')

        if (req_succeeded
                and req.method == 'OPTIONS'
                and req.get_header('Access-Control-Request-Method')
        ):
            # NOTE(kgriffs): This is a CORS preflight request. Patch the
            #   response accordingly.

            allow = resp.get_header('Allow')
            resp.delete_header('Allow')

            allow_headers = req.get_header(
                'Access-Control-Request-Headers',
                default='*'
            )

            resp.set_headers((
                ('Access-Control-Allow-Methods', allow),
                ('Access-Control-Allow-Headers', allow_headers),
                ('Access-Control-Max-Age', '86400'),  # 24 hours
            ))


class CamelSnake:
    def process_request(self, req, resp):
        if req.method in ['POST', 'PUT', 'PATCH']:
            body = json.load(req.stream)
            snaked = {}
            for key in body:
                snake = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', key)
                snake = re.sub('([a-z0-9])([A-Z])', r'\1_\2', snake).lower()
                snaked[snake] = body[key]
            req.context['body'] = snaked

    def process_response(self, req, resp, resource, req_succeeded):
        def convert(obj):
            converted = {}
            for key in obj.keys():
                components = key.split('_')
                camel = key if len(components) == 1 else \
                    components[0] + ''.join(x.title() for x in components[1:])
                converted[camel] = obj[key]
                if isinstance(obj[key], list):
                    converted[key] = list(map(convert, obj[key]))
            return converted

        if resp.body:
            body = json.loads(resp.body)
            if isinstance(body, list):
                new_body = list(map(convert, body))
            else:
                new_body = convert(body)
            resp.body = json.dumps(new_body)


class Todos:
    def on_get(self, req, resp):
        clauses = [(Todo.complete == 0)]
        if req.get_param('search'):
            clauses.append((Todo.headline.contains(req.get_param('search'))))
        if req.get_param_as_bool('remindersOnly'):
            if SnoozeAll.select().where(
                    SnoozeAll.end < dt.utcnow().isoformat()).count() == 0:
                todos = []
            else:
                clauses.append((Todo.next_reminder <= dt.utcnow().isoformat()))
                todos = Todo.select().where(reduce(operator.and_,
                                                   clauses)).order_by(
                    Todo.next_reminder)
        else:
            todos = Todo.select(
                Todo.id, Todo.complete, Todo.headline, Todo.next_reminder,
                Todo.repeat, Todo.created).where(reduce(operator.and_,
                                                 clauses)).order_by(
                Todo.next_reminder.asc())
        ret = []
        for t in todos:
            ret.append(model_to_dict(t))
        resp.body = json.dumps({'data': ret, 'totalCount': len(ret)},
                               cls=Encoder)

    def on_post(self, req, resp):
        if not req.content_length:
            resp.status = falcon.HTTP_422
            return
        data = req.context['body']
        try:
            list, created = TodoList.get_or_create(name=DEFAULT_LIST)
            t = Todo.create(list=list, **data)
            resp.body = json.dumps(model_to_dict(t), cls=Encoder)
            resp.status = falcon.HTTP_201
        except IntegrityError:
            log.exception('Failed to create todo.')
            resp.status = falcon.HTTP_422


class TodoItem:
    def on_delete(self, req, resp, id):
        Todo.delete_by_id(id)
        resp.status = falcon.HTTP_204

    def on_patch(self, req, resp, id):
        data = req.context['body']
        # Not supporting list changes yet.
        if 'list' in data:
            del data['list']
        todo = model_to_dict(Todo.get_by_id(id))
        todo.update(data)
        if 'repeat' in data and data.get('repeat', 'never') == 'never':
            data['repeat'] = None
        if 'complete' in data and data['complete']:
            if data.get('completed_on') is None:
                data['completed_on'] = dt.now()
            if todo.get('repeat') is not None:
                next_reminder = dateparser.parse(
                    REPEATS[todo['repeat']],
                    settings={'PREFER_DATES_FROM': 'future'})
                dup = dict(todo)
                dup.update({
                    'next_reminder': next_reminder,
                    'list': todo['list']['id'],
                    'complete': False,
                    'created': dt.utcnow(),
                })
                del dup['id']
                Todo.create(**dup)

        models.Todo.set_by_id(id, data)
        resp.status = falcon.HTTP_200
        resp.body = json.dumps(todo, cls=Encoder)


class SnoozeAllItem:
    def on_post(self, req, resp):
        data = req.context['body']
        if not SnoozeAll.update(**data).execute():
            SnoozeAll.create(**data)
        data = SnoozeAll.select().get()
        sys.stderr.write(f'DATA: {data}')
        resp.body = json.dumps(model_to_dict(data), cls=Encoder)
        resp.status = falcon.HTTP_201

    def on_get(self, req, resp):
        data = SnoozeAll.select()
        resp.body = json.dumps(model_to_dict(data), cls=Encoder)


api = application = falcon.API(middleware=[CORSComponent(), CamelSnake()])
api.add_route('/todos', Todos())
api.add_route('/todos/{id}', TodoItem())
api.add_route('/snooze-all', SnoozeAllItem())

if __name__ == '__main__':
    httpd = simple_server.make_server('127.0.0.1', 5005, api)
    logger = logging.getLogger('peewee')
    logger.addHandler(logging.StreamHandler())
    logger.setLevel(logging.DEBUG)
    logging.getLogger().setLevel(logging.DEBUG)
    httpd.serve_forever()
