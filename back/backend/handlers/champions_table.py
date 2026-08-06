from backend.lib import formatters
from backend.models.champion import Champion
from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region
from flask import Blueprint, jsonify
from google.cloud import ndb

bp = Blueprint("champions_table", __name__)
client = ndb.Client()


def _format_champion_result(result):
    """Format a champion's display result, robust to a missing average.

    Mean/average-format events normally show the average, but a champion crowned from
    an earlier round (or with a DNF mean) may have no average (``average <= 0``); fall
    back to the single, then to ``DNF`` when neither is present.
    """
    is_average = bool(result.fmt) and result.fmt.id() in ("a", "m")
    if is_average and result.average and result.average > 0:
        return formatters.format_time(result.average, result.event, True)
    if result.best and result.best > 0:
        return formatters.format_time(result.best, result.event, False)
    return "DNF"


def _serialize_champion_result(result, province_id=None):
    """Serialize a single champion ``Result`` for the public champions table."""
    return {
        "wca_id": result.person.id() if result.person else None,
        "name": result.person_name,
        "province": province_id,
        "pos": result.pos,
        "best": result.best,
        "average": result.average,
        "single_record": result.regional_single_record or None,
        "average_record": result.regional_average_record or None,
        "result": _format_champion_result(result),
    }


def serialize_champions(champions):
    """Turn a list of ``Champion`` entities into the per-event champions payload.

    Each ``Champion`` references one or more winning ``Result`` keys (more than one
    only when there is a tie). Results, events and the winners' persons (for the
    province label) are resolved in batched ``get_multi`` calls, then grouped per
    event and ordered by the WCA event rank.
    """
    result_keys = [key for champ in champions for key in champ.champions]
    results = {r.key: r for r in ndb.get_multi(result_keys) if r}

    event_keys = list({champ.event for champ in champions if champ.event})
    events = {e.key: e for e in ndb.get_multi(event_keys) if e}

    person_keys = list({r.person for r in results.values() if r.person})
    persons = {p.key: p for p in ndb.get_multi(person_keys) if p}

    out = []
    for champ in champions:
        event = events.get(champ.event)
        champ_results = [results[key] for key in champ.champions if key in results]
        serialized = []
        for result in champ_results:
            person = persons.get(result.person)
            province_id = person.province.id() if person and person.province else None
            serialized.append(_serialize_champion_result(result, province_id))
        out.append(
            {
                "event_id": champ.event.id() if champ.event else None,
                "event_name": event.name if event else (champ.event.id() if champ.event else None),
                "event_rank": event.rank if event else 999,
                "champions": serialized,
            },
        )
    out.sort(key=lambda c: c["event_rank"])
    return out


def region_championships(region, year_int):
    """Return the (non-PBQ, non-national) championships that represent ``region`` in ``year_int``.

    For a single-province region (BC/ON/QC) the championship is stored as provincial
    (its name matches the province name), so match by that province; otherwise match the
    regional championships for the region.
    """
    province_keys = Province.query(Province.region == region.key).fetch(keys_only=True)
    single_province = province_keys[0] if len(province_keys) == 1 else None

    championships = []
    for championship in Championship.query().iter():
        if championship.national_championship or championship.is_pbq:
            continue
        if championship.year != year_int:
            continue
        if single_province is not None:
            if championship.province == single_province:
                championships.append(championship)
        elif championship.region == region.key:
            championships.append(championship)
    return championships


@bp.route("/champions_by_region/<region_id>/<year>")
def champions_by_region(region_id, year):
    with client.context():
        try:
            year_int = int(year)
        except (TypeError, ValueError):
            return jsonify({"error": f"Invalid year {year}"}), 400

        region = Region.get_by_id(region_id)
        if not region:
            return jsonify({"error": f"Unrecognized region id {region_id}"}), 404

        championship_keys = [c.key for c in region_championships(region, year_int)]
        champions = Champion.query(Champion.championship.IN(championship_keys)).fetch() if championship_keys else []
        return jsonify(serialize_champions(champions))
