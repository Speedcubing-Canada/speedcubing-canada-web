import datetime

from google.cloud import ndb

from backend.models.province import Province
from backend.models.wca.base import BaseModel
from backend.models.wca.country import Country
from backend.models.wca.event import Event


class Competition(BaseModel):
    start_date = ndb.DateProperty()
    end_date = ndb.DateProperty()
    year = ndb.IntegerProperty()

    name = ndb.StringProperty()
    short_name = ndb.StringProperty()

    events = ndb.KeyProperty(kind=Event, repeated=True)

    latitude = ndb.IntegerProperty()
    longitude = ndb.IntegerProperty()

    country = ndb.KeyProperty(kind=Country)
    city_name = ndb.StringProperty()
    province = ndb.KeyProperty(kind=Province)

    def parse_from_dict(self, row):
        self.start_date = datetime.date(int(row['year']), int(row['month']), int(row['day']))
        self.end_date = datetime.date(int(row['year']), int(row['endMonth']), int(row['endDay']))
        self.year = int(row['year'])

        self.name = row['name']
        self.short_name = row['cellName']

        self.events = [ndb.Key(Event, event_id) for event_id in row['eventSpecs'].split(' ')]

        self.latitude = int(row['latitude'])
        self.longitude = int(row['longitude'])

        province = None
        if ',' in row['cityName']:
            city_split = row['cityName'].split(',')
            province_name = city_split[-1].strip()
            province = Province.get_province(province_name)
            self.city_name = ','.join(city_split[:-1])
        if province:
            self.province = province.key
        else:
            self.city_name = row['cityName']
        self.country = ndb.Key(Country, row['countryId'])

    @staticmethod
    def filter():
        # Only load Canada competitions that haven't been cancelled.
        def filter_row(row):
            return row['countryId'] == 'Canada' and int(row['cancelled']) != 1

        return filter_row

    @staticmethod
    def columns_used():
        return ['year', 'month', 'day', 'endMonth', 'endDay', 'cellName', 'eventSpecs',
                'latitude', 'longitude', 'cityName', 'countryId', 'name']

    def get_wca_link(self):
        return 'https://worldcubeassociation.org/competitions/%s' % self.key.id()

    def get_events_string(self):
        return ','.join([e.id() for e in self.events])
