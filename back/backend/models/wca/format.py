from backend.models.wca.base import BaseModel
from google.cloud import ndb


class Format(BaseModel):
    name = ndb.StringProperty()

    def parse_from_dict(self, row):
        self.name = row["name"]

    @staticmethod
    def columns_used():
        return ["name"]
