import datetime
import re

import falcon
import json
import logging
from peewee import IntegrityError
from playhouse.shortcuts import model_to_dict
from wsgiref import simple_server

import models

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
        if isinstance(obj, datetime.datetime):
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
            for key in body:
                snake = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', key)
                snake = re.sub('([a-z0-9])([A-Z])', r'\1_\2', snake).lower()
                body[snake] = body.pop(key)
            req.context['body'] = body

    def process_response(self, req, resp, resource, req_succeeded):
        def convert(obj):
            converted = {}
            for key in obj.keys():
                components = key.split('_')
                camel = key if len(components) == 1 else \
                    components[0] + ''.join(x.title() for x in components[1:])
                converted[camel] = obj[key]
            return converted

        if resp.body:
            body = json.loads(resp.body)
            if isinstance(body, list):
                new_body = list(map(convert, body))
            else:
                new_body = convert(body)
            resp.body = json.dumps(new_body)


class TodoList:
    def on_get(self, req, resp):
        todos = models.Todo.select()
        ret = []
        for t in todos:
            ret.append(model_to_dict(t))
        resp.body = json.dumps(ret, cls=Encoder)

    def on_post(self, req, resp):
        if not req.content_length:
            resp.status = falcon.HTTP_422
            return
        data = req.context['body']
        try:
            t = models.Todo.create(**data)
            resp.body = json.dumps(model_to_dict(t), cls=Encoder)
            resp.status = falcon.HTTP_201
        except IntegrityError as e:
            log.exception('Failed to create todo.')
            resp.status = falcon.HTTP_422


class Todo:
    def on_delete(self, req, resp, id):
        models.Todo.delete_by_id(id)
        resp.status = falcon.HTTP_204


api = application = falcon.API(middleware=[CORSComponent(), CamelSnake()])
api.add_route('/todos', TodoList())
api.add_route('/todos/{id}', Todo())

if __name__ == '__main__':
    httpd = simple_server.make_server('127.0.0.1', 5005, api)
    httpd.serve_forever()
