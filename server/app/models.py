from datetime import datetime as dt
from peewee import *

db = SqliteDatabase('/var/lib/jdo.db')


def connect():
    db.connect()
    db.create_tables([Todo, SnoozeAll])


class BaseModel(Model):
    class Meta:
        database = db


class Todo(BaseModel):
    headline = CharField()
    created = DateField(default=dt.now())
    next_reminder = DateTimeField(null=True)
    note = CharField(null=True)
    repeat = CharField(null=True)
    complete = BooleanField(default=False)
    priority = IntegerField(null=True)


class SnoozeAll(BaseModel):
    end = DateTimeField(null=True)
