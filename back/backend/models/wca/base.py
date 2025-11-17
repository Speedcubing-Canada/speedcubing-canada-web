from google.cloud import ndb


class BaseModel(ndb.Model):
    @staticmethod
    def get_id(row):
        return row['id']

    def parse_from_dict(self, row):
        raise NotImplementedError('parse_from_dict is unimplemented.')

    @staticmethod
    def columns_used():
        raise NotImplementedError('columns_used is unimplemented.')

    @staticmethod
    def filter():
        return lambda row: True

    # If any entities need to be fetched from the datastore before writing,
    # this method should return their keys.  This is used when we have a
    # ComputedProperty.
    def objects_to_get(self):
        return []
