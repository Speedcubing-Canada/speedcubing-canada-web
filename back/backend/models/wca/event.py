from google.cloud import ndb

from backend.models.wca.base import BaseModel


class Event(BaseModel):
    name = ndb.StringProperty()
    rank = ndb.IntegerProperty()

    def parse_from_dict(self, row):
        self.name = row['name']
        self.rank = int(row['rank'])

    @staticmethod
    def columns_used():
        return ['name', 'rank']

    def icon_url(self):
        return '/static/img/events/%s.svg' % self.key.id()
