from google.cloud import ndb

from backend.models.region import Region

# Cache mapping of province names.
provinces_by_name = {}


class Province(ndb.Model):
    name = ndb.StringProperty()
    region = ndb.KeyProperty(kind=Region)
    is_province = ndb.BooleanProperty()

    @staticmethod
    def get_province(province_name):
        global provinces_by_name
        if province_name in provinces_by_name:
            return provinces_by_name[province_name]
        # Check if this is the province ID (two-letter abbreviation)
        maybe_province = Province.get_by_id(province_name.replace('.', '').replace(' ', '').lower())
        if not maybe_province:
            # Or maybe it's the name.
            maybe_province = Province.query(Province.name == province_name).get()
        if maybe_province:
            provinces_by_name[province_name] = maybe_province
        return maybe_province
