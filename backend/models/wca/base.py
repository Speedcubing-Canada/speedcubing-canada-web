from google.cloud import ndb

class BaseModel(ndb.Model):
  @staticmethod
  def GetId(row):
    return row['id']

  def ParseFromDict(self, row):
    raise Exception('ParseFromDict is unimplemented.')

  @staticmethod
  def ColumnsUsed():
    raise Exception('ColumnsUsed is unimplemented.')

  @staticmethod
  def Filter():
    return lambda row: True

  # If any entities need to be fetched from the datastore before writing,
  # this method should return their keys.  This is used when we have a
  # ComputedProperty.
  def ObjectsToGet(self):
    return []
