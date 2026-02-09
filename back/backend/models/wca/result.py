from google.cloud import ndb

from backend.models.championship import Championship
from backend.models.wca.base import BaseModel
from backend.models.wca.competition import Competition
from backend.models.wca.country import Country
from backend.models.wca.event import Event
from backend.models.wca.format import Format
from backend.models.wca.person import Person
from backend.models.wca.round import RoundType


class Result(BaseModel):
    competition = ndb.KeyProperty(kind=Competition)
    event = ndb.KeyProperty(kind=Event)
    round_type = ndb.KeyProperty(kind=RoundType)
    person = ndb.KeyProperty(kind=Person)
    fmt = ndb.KeyProperty(kind=Format)

    person_name = ndb.StringProperty()
    person_country = ndb.KeyProperty(kind=Country)

    pos = ndb.IntegerProperty()
    best = ndb.IntegerProperty()
    average = ndb.IntegerProperty()

    regional_single_record = ndb.StringProperty()
    regional_average_record = ndb.StringProperty()

    def parse_from_dict(self, row):
        self.competition = ndb.Key(Competition, row['competition_id'])
        self.event = ndb.Key(Event, row['event_id'])
        self.round_type = ndb.Key(RoundType, row['round_type_id'])
        self.person = ndb.Key(Person, row['person_id'])
        self.fmt = ndb.Key(Format, row['format_id'])

        self.person_name = row['person_name']
        self.person_country = ndb.Key(Country, row['person_country_id'])

        self.pos = int(row['pos'])
        self.best = int(row['best'])
        self.average = int(row['average'])

        self.regional_single_record = row['regional_single_record']
        self.regional_average_record = row['regional_average_record']

    @staticmethod
    def Filter():
        # Only include results of championships that are in the datastore.
        known_competitions = set([championship.competition.id() for championship in Championship.query().iter()])

        def filter_row(row):
            return row['competition_id'] in known_competitions
        return filter_row

    @staticmethod
    def get_id(row):
        return f"{row['competition_id']}_{row['event_id']}_{row['round_type_id']}_{row['person_id']}"

    @staticmethod
    def columns_used():
        return ['competition_id', 'event_id', 'round_type_id', 'person_id', 'format_id', 'person_name',
                'person_country_id', 'pos', 'best', 'average', 'regional_single_record', 'regional_average_record']
