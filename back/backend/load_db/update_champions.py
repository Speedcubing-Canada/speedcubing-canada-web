import collections
import datetime
import logging
import os

from google.cloud import ndb

from backend.models.champion import Champion
from backend.models.championship import Championship
from backend.models.eligibility import RegionalChampionshipEligibility
from backend.models.eligibility import ProvinceChampionshipEligibility
from backend.models.user import User
from backend.models.wca.country import Country
from backend.models.wca.event import Event
from backend.models.wca.result import Result
from backend.models.wca.result import RoundType


def compute_eligible_competitors(championship, competition, results):
    if championship.national_championship:
        # We don't save this in the datastore because it's easy enough to compute.
        return set([r.person.id() for r in results
                    if r.person_country == ndb.Key(Country, 'Canada')])
    competitors = set([r.person for r in results])
    users = User.query(User.wca_person.IN(competitors)).fetch()
    user_keys = [user.key for user in users]

    # Load the saved eligibilities, so that one person can't be eligible for two
    # championships of the same type.
    if championship.region:
        eligibility_class = RegionalChampionshipEligibility

        def eligibility_field(user):
            if not user.regional_eligibilities:
                user.regional_eligibilities = []
            return user.regional_eligibilities
    else:
        eligibility_class = ProvinceChampionshipEligibility

        def eligibility_field(user):
            if not user.province_eligibilities:
                user.province_eligibilities = []
            return user.province_eligibilities

    valid_province_keys = championship.get_eligible_province_keys()
    residency_deadline = (championship.residency_deadline or
                          datetime.datetime.combine(competition.start_date, datetime.time(0, 0, 0)))

    eligible_competitors = set()
    competitors_to_put = []

    class Resolution:
        ELIGIBLE = 0
        INELIGIBLE = 1
        UNRESOLVED = 2

    for user in users:
        resolution = Resolution.UNRESOLVED
        for eligibility in eligibility_field(user):
            if eligibility.year != championship.year:
                continue
            if eligibility.championship == championship.key:
                resolution = Resolution.ELIGIBLE
            else:
                resolution = Resolution.INELIGIBLE
        # If the competitor hasn't already used their eligibility, check their province.
        if resolution == Resolution.UNRESOLVED:
            province = None
            for update in user.updates or []:
                if update.update_time < residency_deadline:
                    province = update.province
            if province and province in valid_province_keys:
                # This competitor is eligible, so save this on their User.
                resolution = Resolution.ELIGIBLE
                eligibility = eligibility_class()
                eligibility.championship = championship.key
                eligibility_field(user).append(eligibility)
                competitors_to_put.append(user)
            else:
                resolution = Resolution.INELIGIBLE
        if resolution == Resolution.ELIGIBLE:
            eligible_competitors.add(user.wca_person.id())
    ndb.put_multi(competitors_to_put)
    return eligible_competitors


def update_champions():
    champions_to_write = []
    champions_to_delete = []
    final_round_keys = set(r.key for r in RoundType.query(RoundType.final == True).iter())
    all_event_keys = set(e.key for e in Event.query().iter())
    championships_already_computed = set()
    for champion in Champion.query().iter():
        championships_already_computed.add(champion.championship.id())
    for championship in Championship.query().iter():
        if not championship.national_championship and os.environ.get('ENV') == 'DEV':
            # Don't try to compute regional champions on dev, since we don't have
            # location data.
            continue
        competition = championship.competition.get()
        # Only recompute champions from the last 2 weeks, in case there are result updates.
        if (championship.key.id() in championships_already_computed and
                datetime.date.today() - competition.end_date > datetime.timedelta(days=14)):
            continue
        if competition.end_date > datetime.date.today():
            continue
        competition_id = championship.competition.id()
        logging.info('Computing champions for %s' % competition_id)
        results = (Result.query(Result.competition == championship.competition)
                   .order(Result.pos).fetch())
        if not results:
            logging.info('Results are not uploaded yet.  Not computing champions yet.')
            continue
        eligible_competitors = compute_eligible_competitors(championship, competition, results)
        champions = collections.defaultdict(list)
        events_held_with_successes = set()
        for result in results:
            if result.best < 0:
                continue
            if result.round_type not in final_round_keys:
                continue
            this_event = result.event
            # For multi blind, we only recognize pre-2009 champions in 333mbo, since
            # that was the multi-blind event held those years.  For clarity in the
            # champions listings, we list those champions as the 333mbf champions for
            # those years.
            if championship.competition.get().year < 2009:
                if result.event.id() == '333mbo':
                    this_event = ndb.Key(Event, '333mbf')
                elif result.event.id() == '333mbf':
                    continue
            events_held_with_successes.add(this_event)
            if this_event in champions and champions[this_event][0].pos < result.pos:
                continue
            if result.person.id() not in eligible_competitors:
                continue
            champions[this_event].append(result)
            if result.pos > 1 and len(champions) >= len(events_held_with_successes):
                break
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
