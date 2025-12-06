from google.cloud import ndb

from backend.models.region import Region

PROVINCE_NAME_TO_ID = {
    # English names
    'Alberta': 'ab',
    'British Columbia': 'bc',
    'Manitoba': 'mb',
    'New Brunswick': 'nb',
    'Newfoundland and Labrador': 'nl',
    'Nova Scotia': 'ns',
    'Northwest Territories': 'nt',
    'Nunavut': 'nu',
    'Ontario': 'on',
    'Prince Edward Island': 'pe',
    'Quebec': 'qc',
    'Saskatchewan': 'sk',
    'Yukon': 'yt',
    # French names (only those that differ)
    'Colombie-Britannique': 'bc',
    'Nouveau-Brunswick': 'nb',
    'Terre-Neuve-et-Labrador': 'nl',
    'Nouvelle-Écosse': 'ns',
    'Territoires du Nord-Ouest': 'nt',
    'Île-du-Prince-Édouard': 'pe',
    'Québec': 'qc',
}


class Province(ndb.Model):
    name = ndb.StringProperty()
    region = ndb.KeyProperty(kind=Region)
    is_province = ndb.BooleanProperty()

    @staticmethod
    def get_province(province_name):
        # Try to get by ID (two-letter abbreviation)
        normalized_id = province_name.replace('.', '').replace(' ', '').lower()
        maybe_province = Province.get_by_id(normalized_id)
        if maybe_province:
            return maybe_province
        
        province_id = PROVINCE_NAME_TO_ID.get(province_name)
        if province_id:
            return Province.get_by_id(province_id)
        
        return Province.query(Province.name == province_name).get()
