import collections
import logging
import re

from google.cloud import ndb

from backend.models.region import Region
from backend.models.province import Province
from backend.models.championship import Championship
from backend.models.wca.competition import Competition

def update_championships():
  competitions_used = set([championship.competition.id() for championship in Championship.query().iter()])
  championships_used = set([championship.key.id() for championship in Championship.query().iter()])
  provinces = {province.name : province for province in Province.query().iter()}
  regions = {region.championship_name : region for region in Region.query().iter()}

  # Get all competitions
  competitions = [comp for comp in Competition.query() if comp.key.id() not in competitions_used]

  to_write = []

  for competition in competitions:
    if 'Canada' in competition.name or 'Canadian' in competition.name:
      championship = Championship(id=Championship.nationals_id(competition.year))
      championship.national_championship = True
      championship.competition = competition.key
      if championship.key.id() not in championships_used:
        logging.info('Assigning national championship ' + competition.key.id() + ' ' + championship.key.id())
        to_write.append(championship)
      continue
      
    # PBQ pattern (English only)
    pbq_re = re.compile(r'(.*?) (PBQ|Quiet|FMC) Championship (\d{4})', re.IGNORECASE)
    french_re = re.compile(r'Championnat (.+?) (\d{4})', re.IGNORECASE)
    english_re = re.compile(r'(.+?) Championship (\d{4})', re.IGNORECASE)
    
    pbq_match = pbq_re.match(competition.name)
    area_name = None
    is_pbq = False
      
    if pbq_match:
      area_name = pbq_match.group(1).strip()
      is_pbq = True
    else:
      french_match = french_re.match(competition.name)
      if french_match:
        area_name = french_match.group(1).strip()
        # Handle French adjective forms -> base province name
        if area_name.lower() in ['québécois', 'québécoise']:
          area_name = 'Quebec'
        elif area_name.lower() in ['ontarien', 'ontarienne']:
          area_name = 'Ontario'
        is_pbq = False
      else:
        english_match = english_re.match(competition.name)
        if english_match:
          area_name = english_match.group(1).strip()
          is_pbq = False
        
    if area_name:
      championship = None
      if area_name in provinces:
        championship = Championship(id=Championship.province_championship_id(competition.year, provinces[area_name], is_pbq))
        championship.province = provinces[area_name].key
        championship.national_championship = False
      elif area_name in regions:
        championship = Championship(id=Championship.regionals_id(competition.year, regions[area_name], is_pbq))
        championship.region = regions[area_name].key
        championship.national_championship = False
      else:
        logging.info('Failed to match area for: ' + competition.name + ' (area: ' + area_name + ')')
        
      if championship:
        championship.is_pbq = is_pbq
        championship.competition = competition.key
        if championship.key.id() not in championships_used:
          logging.info('Assigning championship ' + competition.key.id() + ' ' + championship.key.id())
          to_write.append(championship)
    else:
      logging.info('Failed to match ' + competition.key.id())
        
  ndb.put_multi(to_write)
