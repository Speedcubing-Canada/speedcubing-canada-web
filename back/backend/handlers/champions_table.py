import sys

from flask import Blueprint, render_template
from google.cloud import ndb

from backend.lib import common
from backend.models.champion import Champion
from backend.models.region import Region
from backend.models.province import Province
from backend.models.wca.event import Event
from backend.test.mock_ndb_client import ndb_client

bp = Blueprint('champions_table', __name__)
if "pytest" in sys.modules:
    client = ndb_client
else:
    client = ndb.Client()



#@bp.route('/async/champions_by_year/<event_id>/<championship_type>/<championship_region>')
#@bp.route('/async/champions_by_region/<event_id>/<championship_type>/<year>')
def champions_table(event_id, championship_type, championship_region='', year=0):
  with client.context():
    is_national = championship_type == 'national'
    is_regional = championship_type == 'regional'
    is_state = championship_type == 'province'

    all_champions = []
    filters = []

    if is_national:
      filters.append(Champion.national_champion == True)
    elif year:
      filters.append(Champion.year == int(year))
      if is_regional:
        filters.append(Champion.region != None)
      elif is_state:
        filters.append(Champion.province != None)
    elif is_regional:
      filters.append(Champion.region == ndb.Key(Region, championship_region))
    elif is_state:
      filters.append(Champion.province == ndb.Key(Province, championship_region))

    filters.append(Champion.event == ndb.Key(Event, str(event_id)))
    all_champions = Champion.query(ndb.AND(*filters)).fetch()
    if year and is_regional:
      all_champions.sort(key = lambda c: c.region.id())
      championship_formatter = lambda c: c.region.get().name
      all_regions = Region.query().fetch()
    elif year and is_state:
      all_champions.sort(key = lambda c: c.province.id())
      championship_formatter = lambda c: c.province.get().name
      all_states = Province.query().fetch()
    else:
      all_champions.sort(key = lambda c: c.championship.id(), reverse = True)
      championship_formatter = lambda c: c.year

    return render_template('champions_table.html',
                           c=common.Common(),
                           champions=all_champions,
                           championship_formatter=championship_formatter)
