from google.cloud import ndb

from backend.models.province import Province
from backend.models.wca.country import BaseModel, Country


class Person(BaseModel):
    # Details from row with subid 1 (i.e. most recent updates)
    name = ndb.StringProperty()
    country = ndb.KeyProperty(kind=Country)
    gender = ndb.StringProperty()

    # The person's province, if they're a Canadian resident.  This isn't computed during
    # the database import.
    province = ndb.KeyProperty(kind=Province)

    def parse_from_dict(self, row):
        self.name = row["name"]
        self.country = ndb.Key(Country, row["country_id"])
        self.gender = row["gender"]

    @staticmethod
    def filter():
        return lambda row: int(row["sub_id"]) == 1

    @staticmethod
    def columns_used():
        return ["name", "country_id", "gender", "wca_id", "sub_id"]

    def get_wca_link(self):
        return f"https://worldcubeassociation.org/persons/{self.key.id()}"

    @staticmethod
    def get_id(row):
        return row["wca_id"]
