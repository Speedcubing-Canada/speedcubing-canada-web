from google.cloud import ndb

from backend.models.province import Province


class LockedResidency(ndb.Model):
    """Represents a locked residency for a specific year.
    
    This prevents competitors from being eligible for multiple championships
    of the same type in the same year.
    """
    year = ndb.IntegerProperty(required=True)
    province = ndb.KeyProperty(kind=Province, required=True)