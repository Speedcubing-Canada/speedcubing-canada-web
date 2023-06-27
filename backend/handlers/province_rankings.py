from flask import Blueprint, render_template
from google.cloud import ndb

from backend.lib import common
from backend.models.province import Province
from backend.models.wca.event import Event
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle

bp = Blueprint('province_rankings', __name__)
client = ndb.Client()

@bp.route('/province_rankings')
def province_rankings():
  with client.context():
    return render_template('province_rankings.html',
                           c=common.Common(wca_disclaimer=True))

@bp.route('/async/province_rankings/<event_id>/<province_id>/<use_average>')
def province_rankings_table(event_id, province_id, use_average):
  with client.context():
    ranking_class = RankAverage if use_average == '1' else RankSingle
    province = Province.get_by_id(province_id)
    if not province:
      self.response.write('Unrecognized province %s' % province_id)
      return
    event = Event.get_by_id(event_id)
    if not event:
      self.response.write('Unrecognized event %s' % event_id)
      return
    rankings = (ranking_class.query(
        ndb.AND(ranking_class.event == event.key,
                ranking_class.province == province.key))
        .order(ranking_class.best)
        .fetch(100))

    people = ndb.get_multi([ranking.person for ranking in rankings])
    people_by_id = {person.key.id() : person for person in people}

    return render_template('province_rankings_table.html',
                           c=common.Common(),
                           is_average=(use_average == '1'),
                           rankings=rankings,
                           people_by_id=people_by_id)
