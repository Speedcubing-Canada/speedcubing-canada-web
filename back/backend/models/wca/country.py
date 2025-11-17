from google.cloud import ndb

from backend.models.wca.base import BaseModel
from backend.models.wca.continent import Continent


class Country(BaseModel):
    name = ndb.StringProperty()
    continent = ndb.KeyProperty(kind=Continent)
    iso2 = ndb.StringProperty()

    def parse_from_dict(self, row):
        self.name = row['name']
        self.continent = ndb.Key(Continent, row['continentId'])
        self.iso2 = row['iso2']

    @staticmethod
    def columns_used():
        return ['name', 'continentId', 'iso2']
