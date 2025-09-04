from google.cloud import ndb

from backend.models.wca.base import BaseModel


class Continent(BaseModel):
    name = ndb.StringProperty()
    recordName = ndb.StringProperty()

    def parse_from_dict(self, row):
        self.name = row['name']
        self.recordName = row['recordName']

    @staticmethod
    def columns_used():
        return ['name', 'recordName']
