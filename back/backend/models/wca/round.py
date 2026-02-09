from google.cloud import ndb

from backend.models.wca.base import BaseModel


class RoundType(BaseModel):
    rank = ndb.IntegerProperty()
    name = ndb.StringProperty()
    is_final = ndb.BooleanProperty()

    def parse_from_dict(self, row):
        self.rank = int(row['rank'])
        self.name = row['cell_name']
        self.is_final = int(row['final']) == 1

    @staticmethod
    def columns_used():
        return ['rank', 'cell_name', 'final']
