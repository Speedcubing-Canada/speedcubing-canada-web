from google.cloud import ndb

from backend.models.wca.base import BaseModel


class Format(BaseModel):
    name = ndb.StringProperty()

    def parse_from_dict(self, row):
        self.name = row['name']

    @staticmethod
    def columns_used():
        return ['name']

    def get_short_name(self):
        # Average of 5 -> Ao5
        return self.name[0] + 'o' + self.name[-1]
