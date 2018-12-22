from datetime import datetime as dt
from peewee import *

db = SqliteDatabase('/var/lib/jdo.db')


def connect():
    db.connect()
    db.create_tables([Todo, TodoList, SnoozeAll])


class BaseModel(Model):
    class Meta:
        database = db


class TodoList(BaseModel):
    name = CharField(unique=True)


class Todo(BaseModel):
    headline = CharField()
    created = DateField(default=dt.now())
    next_reminder = DateTimeField(null=True)
    note = CharField(null=True)
    repeat = CharField(null=True)
    complete = BooleanField(default=False)
    completedOn = DateTimeField(null=True)
    priority = IntegerField(null=True)
    list = ForeignKeyField(TodoList, backref='todos')


class SnoozeAll(BaseModel):
    end = DateTimeField(null=True)
