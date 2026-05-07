import logging

from google.cloud import ndb

from backend.load_db.championship_classifier import classify_competition
from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region
from backend.models.wca.competition import Competition


def update_championships():
    competitions_used = set([championship.competition.id() for championship in Championship.query().iter()])
    championships_used = set([championship.key.id() for championship in Championship.query().iter()])
    provinces = {province.name: province for province in Province.query().iter()}
    regions = {region.championship_name: region for region in Region.query().iter()}

    all_competitions = list(Competition.query())
    # Scan every competition (including already-processed ones) so that FMC Canada
    # is correctly classified even when the main national comp was persisted in a
    # prior run and is no longer in the "new" batch.
    national_years = {comp.year for comp in all_competitions if classify_competition(comp.name)[0]}
    competitions = [comp for comp in all_competitions if comp.key.id() not in competitions_used]

    to_write = []

    for competition in competitions:
        is_national, area_name, is_pbq = classify_competition(competition.name, national_years)

        if is_national:
            is_fmc = area_name == "fmc"
            championship = Championship(id=Championship.nationals_id(competition.year, is_fmc=is_fmc))
            championship.national_championship = True
            championship.is_fmc = is_fmc
            championship.competition = competition.key
            if championship.key.id() not in championships_used:
                logging.info("Assigning national championship " + competition.key.id() + " " + championship.key.id())
                to_write.append(championship)
            continue

        if area_name:
            championship = None
            if area_name in provinces:
                championship = Championship(
                    id=Championship.province_championship_id(competition.year, provinces[area_name], is_pbq)
                )
                championship.province = provinces[area_name].key
                championship.national_championship = False
            elif area_name in regions:
                championship = Championship(id=Championship.regionals_id(competition.year, regions[area_name], is_pbq))
                championship.region = regions[area_name].key
                championship.national_championship = False
            else:
                logging.info("Failed to match area for: " + competition.name + " (area: " + area_name + ")")

            if championship:
                championship.is_pbq = is_pbq
                championship.competition = competition.key
                if championship.key.id() not in championships_used:
                    logging.info("Assigning championship " + competition.key.id() + " " + championship.key.id())
                    to_write.append(championship)
        else:
            logging.info("Failed to match " + competition.key.id())

    ndb.put_multi(to_write)
