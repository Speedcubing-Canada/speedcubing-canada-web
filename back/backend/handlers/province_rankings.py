from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.lib import common
from backend.models.province import Province
from backend.models.wca.event import Event
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle

bp = Blueprint('province_rankings', __name__)
client = ndb.Client()


@bp.route('/province_rankings/<event_id>/<province_id>/<use_average>')
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

        output = []
        last_time = 0
        rank = 0
        for i in range(len(rankings)):
            if rankings[i].best != last_time:
                rank = i + 1
                last_time = rankings[i].best
            output.append({
                "rank": rank,
                "name": rankings[i].person.get().name,
                "url": rankings[i].person.get().GetWCALink(),
                "time": common.Common().formatters.FormatTime(rankings[i].best, rankings[i].event, use_average == '1')
            })
        return jsonify(output)
