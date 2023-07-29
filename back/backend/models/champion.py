from google.cloud import ndb

from backend.models.championship import Championship
from backend.models.wca.event import Event
from backend.models.wca.result import Result

class Champion(ndb.Model):
  championship = ndb.KeyProperty(kind=Championship)
  event = ndb.KeyProperty(kind=Event)
  champions = ndb.KeyProperty(kind=Result, repeated=True)

  national_champion = ndb.ComputedProperty(lambda e: e.championship.get().national_championship)
  region = ndb.ComputedProperty(lambda e: e.championship.get().region)
  province = ndb.ComputedProperty(lambda e: e.championship.get().province)
  year = ndb.ComputedProperty(lambda e: e.championship.get().year)

  @staticmethod
  def Id(championship_id, event_id):
    return '%s_%s' % (championship_id, event_id)
