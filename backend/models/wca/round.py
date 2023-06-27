from google.cloud import ndb

from backend.models.wca.base import BaseModel

class RoundType(BaseModel):
  rank = ndb.IntegerProperty()
  name = ndb.StringProperty()
  final = ndb.BooleanProperty()

  def ParseFromDict(self, row):
    self.rank = int(row['rank'])
    self.name = row['cellName']
    self.final = int(row['final']) == 1

  @staticmethod
  def ColumnsUsed():
    return ['rank', 'cellName', 'final']
