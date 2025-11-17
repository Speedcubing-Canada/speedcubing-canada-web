import datetime
import os
import logging
import requests

from flask import Blueprint, render_template, abort
from google.cloud import ndb

from backend.lib import common
from backend.models.championship import Championship
from backend.models.region import Region
from backend.models.province import Province
from backend.models.user import User

bp = Blueprint('regional', __name__)
client = ndb.Client()

#@bp.route('/regional')
def regional():
  with client.context():
    year = datetime.date.today().year

    championships = Championship.query(ndb.AND(Championship.year == year,
                                               Championship.region != None)).fetch()
    competitions = ndb.get_multi([c.competition for c in championships])

    states = Province.query().fetch()
    regions = Region.query().order(Region.name).fetch()

    championships.sort(key=lambda championship: championship.competition.get().start_date)
    championship_regions = [championship.region for championship in championships]
    regions_missing_championships = [
        region for region in regions if region.key not in championship_regions and not region.obsolete]

    return render_template('regional.html',
                           c=common.Common(wca_disclaimer=True),
                           year=year,
                           championships=championships,
                           regions_missing_championships=regions_missing_championships)

#@bp.route('/regional/title_policy')
def title_policy():
  with client.context():
    return render_template('regional_title.html', c=common.Common())

#@bp.route('/regional/eligibility/<region>/<year>')
def regional_eligibility(region, year):
  with client.context():
    championship = Championship.get_by_id('%s_%d' % (region, int(year)))
    if not championship:
      abort(404)
    competition_id = championship.competition.id()
    wca_host = os.environ.get('WCA_HOST')
    data = requests.get(wca_host + '/api/v0/competitions/' + competition_id + '/wcif/public')
    if data.status_code != 200:
      abort(data.status_code)
    competition = data.json()
    person_keys = [ndb.Key(User, str(person['wcaUserId'])) for person in competition['persons']]
    users = ndb.get_multi(person_keys)
    if championship.region:
      region = championship.region.get()
      eligible_states = [key.id() for key in Province.query(Province.region == region.key).fetch(keys_only=True)]
    elif championship.province:
      eligible_states = [championship.province.id()]
    logging.info(eligible_states)
    logging.info(person_keys)
    logging.info(users)
    eligible_users = [user for user in users if user and user.province and (user.province.id() in eligible_states)]
    ineligible_users = [user for user in users if user and user.province and (user.province.id() not in eligible_states)]
    logging.info(eligible_users)
    logging.info(ineligible_users)
    return render_template('regional_eligibility.html',
                           c=common.Common(),
                           eligible_users=eligible_users,
                           ineligible_users=ineligible_users,
                           competition=competition)
