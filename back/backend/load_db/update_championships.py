import collections
import logging
import re

from google.cloud import ndb

from backend.models.region import Region
from backend.models.province import Province
from backend.models.championship import Championship
from backend.models.wca.competition import Competition


def update_championships():
    """Automatically detect and create Canadian championships.
    
    This function scans competitions to identify Canadian championships
    and creates Championship entities for them.
    """
    competitions_used = set([championship.competition.id() for championship in Championship.query().iter()])
    championships_used = set([championship.key.id() for championship in Championship.query().iter()])
    provinces = {province.name : province for province in Province.query().iter()}
    regions = {region.championship_name : region for region in Region.query().iter()}

    # Helper function to find region by name (handles variations like Prairie/Prairies)
    def find_region(area_name):
        if area_name in regions:
            return regions[area_name]
        
        for region_name, region in regions.items():
            if (area_name.lower() in region_name.lower() or 
                region_name.lower() in area_name.lower() or
                area_name.lower() == region_name.lower()):
                return region
        return None

    # Order is important: check national first, then regional, then provincial
    national_re = re.compile(r'(Canadian Championship|Championnat Canadien|Canadian Open) (\d{4})', re.IGNORECASE)
    regional_re = re.compile(r'Canadian (.+?) Championship (\d{4})', re.IGNORECASE)
    provincial_re = re.compile(r'(.+?) Championnat (\d{4})|(.+?) Championship (\d{4})', re.IGNORECASE)

    to_write = []

    for competition in Competition.query().iter():
        if competition.key.id() in competitions_used:
            continue
            
        area_name = None
        championship = None
        year = None
        
        # Check for national championship
        national_match = national_re.search(competition.name)
        if national_match:
            # Extract year from the second group (always the year)
            year = int(national_match.group(2))
            championship = Championship(
                id='%s_%d' % ('canada', year),
                year=year,
                competition=competition.key,
                national_championship=True,
                residency_deadline=None
            )
            logging.info('Found Canadian National Championship: %s' % competition.name)
        
        # Check for regional championships: "Canadian [Region] Championship YYYY"
        elif regional_re.search(competition.name):
            regional_match = regional_re.search(competition.name)
            if regional_match:
                area_name = regional_match.group(1).strip()
                year = int(regional_match.group(2))
                
                region = find_region(area_name)
                if region:
                    championship = Championship(
                        id='%s_%d' % (region.key.id(), year),
                        year=year,
                        competition=competition.key,
                        national_championship=False,
                        region=region.key,
                        residency_deadline=None
                    )
                    logging.info('Found Regional Championship: %s for %s' % (competition.name, area_name))
        
        # Check for provincial championships
        elif any(province_name in competition.name for province_name in provinces.keys()):
            provincial_match = provincial_re.search(competition.name)
            if provincial_match:
                groups = provincial_match.groups()
                area_name = None
                year = None
                
                if groups[0]:  # French pattern: "Province Championnat YYYY"
                    area_name = groups[0].strip()
                    year = int(groups[1])
                elif groups[2]:  # English pattern: "Province Championship YYYY" 
                    area_name = groups[2].strip()
                    year = int(groups[3])
                
                if area_name and year and area_name in provinces:
                    championship = Championship(
                        id='%s_%d' % (provinces[area_name].key.id(), year),
                        year=year,
                        competition=competition.key,
                        national_championship=False,
                        provinces=[provinces[area_name].key],
                        residency_deadline=None
                    )
                    logging.info('Found Provincial Championship: %s for %s' % (competition.name, area_name))

        if championship:
            to_write.append(championship)

    if to_write:
        logging.info('Creating %d new championships' % len(to_write))
        ndb.put_multi(to_write)
    else:
        logging.info('No new championships found')


if __name__ == '__main__':
    update_championships()