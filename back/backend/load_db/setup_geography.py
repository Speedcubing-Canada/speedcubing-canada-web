from backend.models.province import Province
from backend.models.region import Region


def _make_region(region_id, region_name, championship_name, all_regions, futures):
    region = Region.get_by_id(region_id) or Region(id=region_id)
    region.name = region_name
    region.championship_name = championship_name
    futures.append(region.put_async())
    all_regions[region_id] = region
    return region


def _make_province(province_id, province_name, region, is_province, all_provinces, futures):
    province = Province.get_by_id(province_id) or Province(id=province_id)
    province.name = province_name
    province.region = region.key
    province.is_province = is_province
    futures.append(province.put_async())
    all_provinces[province_id] = province
    return province


# Provinces and regions standards come from the following source:
# https://www12.statcan.gc.ca/census-recensement/2021/ref/dict/tab/index-eng.cfm?ID=t1_8
def setup_regions_and_provinces():
    """Upsert the canonical SCC regions/provinces and delete any non-canonical ones.

    Idempotent: existing entities are updated in place by their stable id, missing ones
    are created, and entities whose id is no longer canonical (e.g. a stale ``"nw"``
    Territories region) are deleted. Must be called inside an active ``ndb`` context.
    This is the single source of truth shared by the ``/admin/update_provinces`` route
    and the ``load_db`` pipeline so the datastore never drifts from the code.
    """
    futures = []
    all_regions = {}
    ATLANTIC = _make_region("at", "Atlantic", "Atlantic", all_regions, futures)
    QUEBEC = _make_region("qc", "Quebec", "Quebec", all_regions, futures)
    ONTARIO = _make_region("on", "Ontario", "Ontario", all_regions, futures)
    PRAIRIES = _make_region("pr", "Prairies", "Prairies", all_regions, futures)
    BRITISH_COLUMBIA = _make_region("bc", "British Columbia", "British Columbia", all_regions, futures)
    TERRITORIES = _make_region("te", "Territories", "Territories", all_regions, futures)

    for future in futures:
        future.wait()
    del futures[:]

    all_provinces = {}
    for province_id, province_name, region in (
        ("nl", "Newfoundland and Labrador", ATLANTIC),
        ("pe", "Prince Edward Island", ATLANTIC),
        ("ns", "Nova Scotia", ATLANTIC),
        ("nb", "New Brunswick", ATLANTIC),
        ("qc", "Quebec", QUEBEC),
        ("on", "Ontario", ONTARIO),
        ("mb", "Manitoba", PRAIRIES),
        ("sk", "Saskatchewan", PRAIRIES),
        ("ab", "Alberta", PRAIRIES),
        ("bc", "British Columbia", BRITISH_COLUMBIA),
    ):
        _make_province(province_id, province_name, region, True, all_provinces, futures)

    for territory_id, territory_name, region in (
        ("yt", "Yukon", TERRITORIES),
        ("nt", "Northwest Territories", TERRITORIES),
        ("nu", "Nunavut", TERRITORIES),
    ):
        _make_province(territory_id, territory_name, region, False, all_provinces, futures)

    for future in futures:
        future.wait()
    del futures[:]

    for region in Region.query().iter():
        if region.key.id() not in all_regions:
            region.key.delete()
    for province in Province.query().iter():
        if province.key.id() not in all_provinces:
            province.key.delete()
