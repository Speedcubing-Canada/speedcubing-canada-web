from google.cloud import ndb

from backend.models.wca.base import BaseModel
from backend.models.wca.event import Event
from backend.models.wca.person import Person


class RankBase(BaseModel):
    person = ndb.KeyProperty(kind=Person)
    event = ndb.KeyProperty(kind=Event)
    best = ndb.IntegerProperty()
    province = ndb.ComputedProperty(lambda self: self.get_province())

    def get_province(self):
        if not self.person or not self.person.get():
            return None
        return self.person.get().province

    @staticmethod
    def get_id(row):
        return f"{row['personId']}_{row['eventId']}"}

    def parse_from_dict(self, row):
        self.person = ndb.Key(Person, row['personId'])
        self.event = ndb.Key(Event, row['eventId'])
        self.best = int(row['best'])

    @staticmethod
    def columns_used():
        return ['personId', 'eventId', 'best']

    def objects_to_get(self):
        return [self.person]


class RankAverage(RankBase):
    pass


class RankSingle(RankBase):
    pass
