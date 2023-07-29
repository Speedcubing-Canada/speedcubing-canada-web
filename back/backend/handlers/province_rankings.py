from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.models.province import Province
from backend.models.wca.event import Event
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle

bp = Blueprint('province_rankings', __name__)
client = ndb.Client()

@bp.route('/async/province_rankings/<event_id>/<province_id>/<use_average>')
def province_rankings_table(event_id, province_id, use_average):
  with client.context():
    ranking_class = RankAverage if use_average == '1' else RankSingle
    province = Province.get_by_id(province_id)
    if not province:
      return jsonify({"error": "Unrecognized province id %s" % province}), 404
    event = Event.get_by_id(event_id)
    if not event:
      return jsonify({"error": "Unrecognized event id %s" % event}), 404
    rankings = (ranking_class.query(
        ndb.AND(ranking_class.event == event.key,
                ranking_class.province == province.key))
        .order(ranking_class.best)
        .fetch(100))

    people = ndb.get_multi([ranking.person for ranking in rankings])
    people_by_id = {person.key.id() : person for person in people}

    return jsonify({
      "rankings": rankings,
      "people_by_id": people_by_id,
    })
    """return render_template('province_rankings_table.html',
                           c=common.Common(),
                           is_average=(use_average == '1'),
                           rankings=rankings,
                           people_by_id=people_by_id)"""
