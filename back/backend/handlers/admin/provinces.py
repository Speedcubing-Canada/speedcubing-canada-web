from flask import abort, Blueprint
from google.cloud import ndb

from backend.lib import auth
from backend.models.region import Region
from backend.models.province import Province
from backend.models.user import Roles

bp = Blueprint('provinces', __name__)
client = ndb.Client()

def MakeRegion(region_id, region_name, championship_name, all_regions, futures):
  region = Region.get_by_id(region_id) or Region(id=region_id)
  region.name = region_name
  region.championship_name = championship_name
  futures.append(region.put_async())
  all_regions[region_id] = region
  return region

def MakeProvince(province_id, province_name, region, is_province, all_provinces, futures):
  province = Province.get_by_id(province_id) or Province(id=province_id)
  province.name = province_name
  province.region = region.key
  province.is_province = is_province
  futures.append(province.put_async())
  all_provinces[province_id] = province
  return province

# Provinces and regions standards come from the following source:
# https://www12.statcan.gc.ca/census-recensement/2021/ref/dict/tab/index-eng.cfm?ID=t1_8
@bp.route('/update_provinces')
def update_provinces():
  with client.context():
    me = auth.user()
    if not me or not me.HasAnyRole([Roles.GLOBAL_ADMIN, Roles.WEBMASTER]):
      abort(403)

    futures = []
    all_regions = {}
    ATLANTIC = MakeRegion('at', 'Atlantic', 'Atlantic',all_regions, futures)
    QUEBEC = MakeRegion('qc', 'Quebec', 'Quebec', all_regions, futures)
    ONTARIO = MakeRegion('on', 'Ontario', 'Ontario', all_regions, futures)
    PRAIRIES = MakeRegion('pr', 'Prairies', 'Prairies', all_regions, futures)
    BRITISH_COLUMBIA = MakeRegion('bc', 'British Columbia', 'British Columbia', all_regions, futures)
    TERRITORIES = MakeRegion('nw', 'Territories', 'Territories', all_regions, futures)


    for future in futures:
      future.wait()
    del futures[:]

    all_provinces = {}
    for province_id, province_name, region in (
        ('nl', 'Newfoundland and Labrador', ATLANTIC),
        ('pe', 'Prince Edward Island', ATLANTIC),
        ('ns', 'Nova Scotia', ATLANTIC),
        ('nb', 'New Brunswick', ATLANTIC),
        ('qc', 'Quebec', QUEBEC),
        ('on', 'Ontario', ONTARIO),
        ('mb', 'Manitoba', PRAIRIES),
        ('sk', 'Saskatchewan', PRAIRIES),
        ('ab', 'Alberta', PRAIRIES),
        ('bc', 'British Columbia', BRITISH_COLUMBIA)):
      MakeProvince(province_id, province_name, region, True, all_provinces, futures)

    for territory_id, territory_name, region in (
        ('yt', 'Yukon', TERRITORIES),
        ('nt', 'Northwest Territories', TERRITORIES),
        ('nu', 'Nunavut', TERRITORIES)):
      MakeProvince(territory_id, territory_name, region, False, all_provinces, futures)

    for future in futures:
      future.wait()
    del futures[:]

    for region in Region.query().iter():
      if region.key.id() not in all_regions:
        region.delete()
    for province in Province.query().iter():
      if province.key.id() not in all_provinces:
        province.delete()
    return 'ok'
