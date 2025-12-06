from google.cloud import ndb

from backend.models.championship import Championship
from backend.models.province import Province


class RegionalChampionshipEligibility(ndb.Model):
    championship = ndb.KeyProperty(kind=Championship)
    year = ndb.ComputedProperty(lambda self: self.championship.get().year)
    region = ndb.ComputedProperty(lambda self: self.championship.get().region)


class ProvinceChampionshipEligibility(ndb.Model):
    championship = ndb.KeyProperty(kind=Championship)
    year = ndb.ComputedProperty(lambda self: self.championship.get().year)
    province = ndb.ComputedProperty(lambda self: self.championship.get().province)


class LockedResidency(ndb.Model):
    """Prevents competitors from being eligible for multiple championships of the same type.
    
    When a competitor participates in a championship, their residency is locked
    to prevent them from being eligible for other championships of the same type
    in the same year.
    """
    year = ndb.IntegerProperty()
    province = ndb.KeyProperty(kind=Province)
