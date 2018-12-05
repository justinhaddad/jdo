import datetime
import falcon
import json
from . import models
import logging
from peewee import IntegrityError
from playhouse.shortcuts import model_to_dict

log = logging.getLogger(__name__)
count = 0
models.connect()


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
        data = json.load(req.stream)
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


api = application = falcon.API(middleware=CORSComponent())
api.add_route('/todos', TodoList())
api.add_route('/todos/{id}', Todo())
