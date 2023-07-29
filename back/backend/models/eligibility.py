from google.cloud import ndb

from backend.models.championship import Championship

class RegionalChampionshipEligibility(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  region = ndb.ComputedProperty(lambda self: self.championship.get().region)


class ProvinceChampionshipEligibility(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  year = ndb.ComputedProperty(lambda self: self.championship.get().year)
  province = ndb.ComputedProperty(lambda self: self.championship.get().province)
