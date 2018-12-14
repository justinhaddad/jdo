from datetime import datetime as dt
from peewee import *

db = SqliteDatabase('/var/lib/jdo.db')


def connect():
    db.connect()
    db.create_tables([Todo])


class Todo(Model):
    headline = CharField()
    created = DateField(default=dt.now())
    next_reminder = DateTimeField(null=True)
    note = CharField(null=True)
    repeat = CharField(null=True)
    complete = BooleanField(default=False)
    priority = IntegerField(null=True)

    class Meta:
        database = db
