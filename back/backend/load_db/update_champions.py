import collections
import datetime
import logging
import os

from backend.lib.residency import resolve_residency
from backend.models.champion import Champion
from backend.models.championship import Championship
from backend.models.eligibility import ProvinceChampionshipEligibility, RegionalChampionshipEligibility
from backend.models.user import User
from backend.models.wca.country import Country
from backend.models.wca.event import Event
from backend.models.wca.result import Result, RoundType
from google.cloud import ndb

logger = logging.getLogger(__name__)

# Datastore/Firestore caps an ``IN`` filter at 30 values.
_IN_QUERY_LIMIT = 30


def fetch_users_for_competitors(competitors):
    """Fetch the Users for a set of person keys, batching around the IN-query cap.

    ``competitors`` is the set of every ``Result.person`` key for a championship,
    which is routinely larger than the 30-value ``IN`` limit, so we query in chunks.
    """
    competitors = list(competitors)
    users = []
    for start in range(0, len(competitors), _IN_QUERY_LIMIT):
        chunk = competitors[start : start + _IN_QUERY_LIMIT]
        users.extend(User.query(User.wca_person.IN(chunk)).fetch())
    return users


def _championship_attrs(championship_key, cache):
    """Return ``(year, region_key, province_key)`` for a championship, memoized.

    ``RegionalChampionshipEligibility``/``ProvinceChampionshipEligibility`` expose
    ``year``/``region``/``province`` as ``ComputedProperty`` lambdas that each run
    ``self.championship.get()`` on every access. Reading them inside the per-user
    eligibility loop would be a datastore round-trip per access; caching the resolved
    tuple per championship key collapses that to one ``.get()`` per championship.
    """
    attrs = cache.get(championship_key)
    if attrs is None:
        champ = championship_key.get()
        attrs = (champ.year, champ.region, champ.province)
        cache[championship_key] = attrs
    return attrs


def resolve_eligibility(user, championship, valid_province_keys, residency_deadline, is_regional, champ_attr_cache):
    """Decide whether ``user`` is eligible for ``championship`` and lock them in.

    Eligibility is residency-based with per-tier, per-year locking: once a user has
    been found eligible for a championship of a given tier in a year, that choice is
    cached on the user (``regional_eligibilities`` / ``province_eligibilities``) and a
    different championship of the same tier/year will not also crown them.

    ``champ_attr_cache`` memoizes the ``(year, region, province)`` lookups across users
    (see ``_championship_attrs``). Returns ``(is_eligible, user_modified)`` where
    ``user_modified`` indicates a new eligibility was appended and the user needs to be
    persisted.
    """
    target_year, target_region, _ = _championship_attrs(championship.key, champ_attr_cache)
    existing_eligibilities = user.regional_eligibilities if is_regional else user.province_eligibilities

    for eligibility in existing_eligibilities:
        elig_year, elig_region, elig_province = _championship_attrs(eligibility.championship, champ_attr_cache)
        if elig_year != target_year:
            continue
        if is_regional:
            return elig_region == target_region, False
        return elig_province in valid_province_keys, False

    province = resolve_residency(user, residency_deadline)
    if province and province in valid_province_keys:
        if is_regional:
            eligibility = RegionalChampionshipEligibility()
            eligibility.championship = championship.key
            user.regional_eligibilities.append(eligibility)
        else:
            eligibility = ProvinceChampionshipEligibility()
            eligibility.championship = championship.key
            user.province_eligibilities.append(eligibility)
        return True, True

    return False, False


def compute_eligible_competitors(championship, competition, results):
    if championship.national_championship:
        return {r.person.id() for r in results if r.person_country == ndb.Key(Country, "Canada")}

    valid_province_keys = championship.get_eligible_province_keys()
    residency_deadline = championship.residency_deadline or datetime.datetime.combine(
        competition.start_date,
        datetime.time(0, 0, 0),
    )

    competitors = {r.person for r in results}
    users = fetch_users_for_competitors(competitors)

    is_regional = bool(championship.region)

    eligible_competitors = set()
    competitors_to_put = []
    # Seed the cache with the target championship's attrs (we already hold the entity)
    # so neither the target nor any repeated lock lookup re-fetches it per user.
    champ_attr_cache = {championship.key: (championship.year, championship.region, championship.province)}

    for user in users:
        eligible, modified = resolve_eligibility(
            user,
            championship,
            valid_province_keys,
            residency_deadline,
            is_regional,
            champ_attr_cache,
        )
        if modified:
            competitors_to_put.append(user)
        if eligible:
            eligible_competitors.add(user.wca_person.id())

    ndb.put_multi(competitors_to_put)
    return eligible_competitors


def select_champions(results, eligible_competitors, round_ranks, year):
    """Pick the champion Result(s) per event for a championship.

    For each event the champion is the eligible competitor who reached the
    most-final round (ranked by ``round_ranks``: higher = closer to the final), and
    within that round placed best by ``Result.pos``. This means the final winner when
    an eligible competitor is in the final, and otherwise the best eligible competitor
    from the latest round any eligible competitor reached (e.g. the semi-final). Ties
    at the winning position are all kept.

    Skips DNF/DNS results (``best <= 0``) and non-eligible competitors, and maps the
    pre-2009 multi-blind event ``333mbo`` onto ``333mbf``. ``round_ranks`` maps a
    ``RoundType`` key to its rank. Returns ``{event_key: [Result, ...]}``.
    """
    results_by_event = collections.defaultdict(list)
    for result in results:
        if result.best is None or result.best <= 0:
            continue
        if result.person.id() not in eligible_competitors:
            continue
        this_event = result.event
        # For multi blind, we only recognize pre-2009 champions in 333mbo, since that
        # was the multi-blind event held those years.  For clarity in the champions
        # listings, we list those champions as the 333mbf champions for those years.
        if year < 2009:
            if result.event.id() == "333mbo":
                this_event = ndb.Key(Event, "333mbf")
            elif result.event.id() == "333mbf":
                continue
        results_by_event[this_event].append(result)

    champions = {}
    for event_key, event_results in results_by_event.items():
        furthest_rank = max(round_ranks.get(r.round_type, -1) for r in event_results)
        finalists = [r for r in event_results if round_ranks.get(r.round_type, -1) == furthest_rank]
        best_pos = min(r.pos for r in finalists)
        champions[event_key] = [r for r in finalists if r.pos == best_pos]
    return champions


def update_champions(recompute_all=False):
    """Recompute champions for championships that ended in the last 2 weeks.

    Eligibility comes from User rows, which can appear long after the competition (a
    member signs up, links a WCA ID or sets a province years later), and those are *not*
    picked up here: an already-computed championship outside the window is never
    revisited. Crowning a late arrival takes a manual /admin/recompute_championships,
    which passes ``recompute_all``.
    """
    champions_to_write = []
    champions_to_delete = []
    round_ranks = {r.key: r.rank for r in RoundType.query().iter()}
    all_event_keys = {e.key for e in Event.query().iter()}
    championships_already_computed = set()
    for champion in Champion.query().iter():
        championships_already_computed.add(champion.championship.id())
    computed = 0
    skipped = 0
    pending = 0
    for championship in Championship.query().iter():
        if not championship.national_championship and os.environ.get("ENV") == "DEV":
            # Don't try to compute regional/provincial champions on dev, since
            # we don't have location data.
            continue
        competition = championship.competition.get()
        if (
            not recompute_all
            and championship.key.id() in championships_already_computed
            and datetime.date.today() - competition.end_date > datetime.timedelta(days=14)
        ):
            skipped += 1
            continue
        if competition.end_date > datetime.date.today():
            continue
        results = Result.query(Result.competition == championship.competition).order(Result.pos).fetch()
        if not results:
            logger.info("Results are not uploaded yet for %s.", championship.competition.id())
            pending += 1
            continue
        computed += 1
        eligible_competitors = compute_eligible_competitors(championship, competition, results)
        champions = select_champions(results, eligible_competitors, round_ranks, competition.year)
        for event_key in all_event_keys:
            champion_id = Champion.id(championship.key.id(), event_key.id())
            if event_key in champions:
                champion = Champion.get_by_id(champion_id) or Champion(id=champion_id)
                champion.championship = championship.key
                champion.event = event_key
                champion.champions = [c.key for c in champions[event_key]]
                champions_to_write.append(champion)
            else:
                champions_to_delete.append(ndb.Key(Champion, champion_id))
    ndb.put_multi(champions_to_write)
    ndb.delete_multi(champions_to_delete)
    logger.info(
        "Computed champions for %d championships (%d skipped, %d awaiting results, %d titles written, %d cleared).",
        computed,
        skipped,
        pending,
        len(champions_to_write),
        len(champions_to_delete),
    )
