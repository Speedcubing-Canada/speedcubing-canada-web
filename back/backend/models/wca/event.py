from google.cloud import ndb

from backend.models.wca.base import BaseModel


class Event(BaseModel):
    name = ndb.StringProperty()
    rank = ndb.IntegerProperty()

    def ParseFromDict(self, row):
        self.name = row['name']
        self.rank = int(row['rank'])

    @staticmethod
    def ColumnsUsed():
        return ['name', 'rank']

    def IconURL(self):
        return '/static/img/events/%s.svg' % self.key.id()
