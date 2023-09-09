from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.lib import common
from backend.models.province import Province
from backend.models.wca.event import Event
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle

bp = Blueprint('province_rankings', __name__)
client = ndb.Client()

@bp.route('/test_rankings')
def test_rankings():
    data=[{"name":"Jonathan Esparaz","rank":1,"time":"5.52","url":"https://worldcubeassociation.org/persons/2013ESPA01"},{"name":"Wilson Alvis (\u9648\u667a\u80dc)","rank":2,"time":"7.10","url":"https://worldcubeassociation.org/persons/2011ALVI01"},{"name":"Sarah Strong","rank":3,"time":"9.18","url":"https://worldcubeassociation.org/persons/2007STRO01"},{"name":"Alexandre Ondet","rank":4,"time":"9.84","url":"https://worldcubeassociation.org/persons/2017ONDE01"},{"name":"Abdullah Gulab","rank":5,"time":"10.86","url":"https://worldcubeassociation.org/persons/2014GULA02"},{"name":"Nicholas McKee","rank":6,"time":"11.30","url":"https://worldcubeassociation.org/persons/2015MCKE02"},{"name":"Alyssa Esparaz","rank":7,"time":"16.11","url":"https://worldcubeassociation.org/persons/2014ESPA01"},{"name":"Daniel Daoust","rank":8,"time":"23.40","url":"https://worldcubeassociation.org/persons/2017DAOU01"}]
    return jsonify(data)

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
                "url": rankings[i].person.get().get_wca_link(),
                "time": common.Common().formatters.format_time(rankings[i].best, rankings[i].event, use_average == '1')
            })
        return jsonify(output)
