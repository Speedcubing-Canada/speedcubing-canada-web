from abc import ABCMeta, abstractmethod

from google.cloud import ndb


# Combine metaclasses to avoid conflict
class CombinedMeta(type(ndb.Model), ABCMeta):
    pass


class BaseModel(ndb.Model, metaclass=CombinedMeta):
    @staticmethod
    def get_id(row):
        return row['id']

    @abstractmethod
    def parse_from_dict(self, row):
        pass

    @staticmethod
    @abstractmethod
    def columns_used():
        pass

    @staticmethod
    def filter():
        return lambda row: True

    # If any entities need to be fetched from the datastore before writing,
    # this method should return their keys.  This is used when we have a
    # ComputedProperty.
    def objects_to_get(self):
        return []
