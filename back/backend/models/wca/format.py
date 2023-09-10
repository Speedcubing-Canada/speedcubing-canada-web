from google.cloud import ndb

from backend.models.wca.base import BaseModel


class Format(BaseModel):
    name = ndb.StringProperty()

    def parse_from_dict(self, row):
        self.name = row['name']

    @staticmethod
    def columns_used():
        return ['name']
