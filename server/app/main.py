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


class TodoList:
    def on_get(self, req, resp):
        todos = models.Todo.select()
        ret = []
        for t in todos:
            ret.append(model_to_dict(t))
        log.warning('Return: %s' % ret)
        resp.body = json.dumps(ret, cls=Encoder)

    def on_post(self, req, resp):
        if not req.content_length:
            resp.status = falcon.HTTP_422
            return
        data = json.load(req.stream)
        try:
            t = models.Todo.create(**data)
            log.warning('Create: %s' % model_to_dict(t))
            resp.body = json.dumps(model_to_dict(t), cls=Encoder)
            resp.status = falcon.HTTP_201
        except IntegrityError as e:
            log.exception('Failed to create todo.')
            resp.status = falcon.HTTP_422


api = application = falcon.API()
api.add_route('/todos', TodoList())
