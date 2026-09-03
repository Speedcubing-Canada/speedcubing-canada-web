import logging

from backend.load_db.championship_classifier import classify_competition
from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region
from backend.models.wca.competition import Competition
from google.cloud import ndb

logger = logging.getLogger(__name__)


def update_championships() -> None:
    competitions_used = {championship.competition.id() for championship in Championship.query().iter()}
    championships_used = {championship.key.id() for championship in Championship.query().iter()}
    provinces = {province.name: province for province in Province.query().iter()}
    regions = {region.championship_name: region for region in Region.query().iter()}

    all_competitions = list(Competition.query())
    # Scan every competition (including already-processed ones) so that FMC Canada
    # is correctly classified even when the main national comp was persisted in a
    # prior run and is no longer in the "new" batch.
    national_years = {comp.year for comp in all_competitions if classify_competition(comp.name)[0]}
    competitions = [comp for comp in all_competitions if comp.key.id() not in competitions_used]

    to_write = []
    unmatched_areas = set()
    not_championships = 0

    for competition in competitions:
        is_national, area_name, is_pbq = classify_competition(competition.name, national_years)

        if is_national:
            is_fmc = area_name == "fmc"
            championship = Championship(id=Championship.nationals_id(competition.year, is_fmc=is_fmc))
            championship.national_championship = True
            championship.is_fmc = is_fmc
            championship.competition = competition.key
            if championship.key.id() not in championships_used:
                logger.info("Assigning national championship %s %s", competition.key.id(), championship.key.id())
                to_write.append(championship)
            continue

        if area_name:
            championship = None
            if area_name in provinces:
                championship = Championship(
                    id=Championship.province_championship_id(competition.year, provinces[area_name], is_pbq),
                )
                championship.province = provinces[area_name].key
                championship.national_championship = False
            elif area_name in regions:
                championship = Championship(id=Championship.regionals_id(competition.year, regions[area_name], is_pbq))
                championship.region = regions[area_name].key
                championship.national_championship = False
            else:
                unmatched_areas.add(area_name)

            if championship:
                championship.is_pbq = is_pbq
                championship.competition = competition.key
                if championship.key.id() not in championships_used:
                    logger.info("Assigning championship %s %s", competition.key.id(), championship.key.id())
                    to_write.append(championship)
        else:
            not_championships += 1

    ndb.put_multi(to_write)
    if unmatched_areas:
        # A name parsed as a championship but its area is in neither Province.name nor
        # Region.championship_name: a real gap in championship_classifier.AREA_NAME_MAP.
        logger.warning("Unknown championship areas: %s", ", ".join(sorted(unmatched_areas)))
    logger.info("Assigned %d championships (%d competitions are not championships).", len(to_write), not_championships)
