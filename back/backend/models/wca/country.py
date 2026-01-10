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

    def create_test_country(self, name, continent, iso2):
        self.name = name
        self.continent = continent
        self.iso2 = iso2
        return self

    @staticmethod
    def columns_used():
        return ['name', 'continentId', 'iso2']
