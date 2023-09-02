from google.cloud import ndb

from backend.models.region import Region
from backend.models.province import Province
from backend.models.wca.competition import Competition


class Championship(ndb.Model):
    national_championship = ndb.BooleanProperty()
    region = ndb.KeyProperty(kind=Region)
    province = ndb.KeyProperty(kind=Province)

    competition = ndb.KeyProperty(kind=Competition)

    year = ndb.ComputedProperty(lambda self: self.competition.get().year)

    residency_deadline = ndb.DateTimeProperty()
    residency_timezone = ndb.StringProperty()

    @staticmethod
    def NationalsId(year):
        return str(year)

    @staticmethod
    def RegionalsId(year, region):
        return '%s_%d' % (region.key.id(), year)

    @staticmethod
    def ProvinceChampionshipId(year, province):
        return '%s_%d' % (province.key.id(), year)

    def GetEligibleProvinceKeys(self):
        if self.province:
            return [self.province]
        if self.region:
            return Province.query(Province.region == self.region).fetch(keys_only=True)
        # National championships are not based on residence, they're based on
        # citizenship.
        return None
