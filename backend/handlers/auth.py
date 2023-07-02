import datetime
import os

from flask import Blueprint, url_for, redirect, request, session
from google.cloud import ndb

from backend.lib.secrets import get_secret
from backend.models.user import User, Roles
from backend.models.wca.person import Person
from backend.models.wca.rank import RankSingle, RankAverage

client = ndb.Client()

def create_bp(oauth):
  bp = Blueprint('auth', __name__)

  @bp.route('/login')
  def login():
    redirect_uri = url_for('auth.oauth_callback', _external=True)
    session['referrer'] = request.referrer
    return oauth.wca.authorize_redirect(redirect_uri)

  @bp.route('/oauth_callback')
  def oauth_callback():
    with client.context():
      token = oauth.wca.authorize_access_token()
      resp = oauth.wca.get('me')
      resp.raise_for_status()

      wca_info = resp.json()['me']
      session['wca_account_number'] = str(wca_info['id'])
      session.permanent = True

      user = User.get_by_id(str(wca_info['id'])) or User(id=str(wca_info['id']))
      if 'wca_id' in wca_info and wca_info['wca_id']:
        user.wca_person = ndb.Key(Person, wca_info['wca_id'])
        # If the user has a province on their account, we should update this on the
        # Person and Ranks as well.
        if user.province:
          person = user.wca_person.get()
          if person:
            person.province = user.province
            person.put()
            for rank_class in (RankSingle, RankAverage):
              ndb.put_multi(rank_class.query(rank_class.person == person.key).fetch())
      else:
        del user.wca_person

      if 'name' in wca_info:
        user.name = wca_info['name']
      else:
        del user.name

      if 'email' in wca_info:
        user.email = wca_info['email']
      else:
        del user.email

      user.roles = [role for role in user.roles if role not in Roles.DelegateRoles()]
      if 'delegate_status' in wca_info:
        if wca_info['delegate_status'] == 'senior_delegate':
          user.roles.append(Roles.SENIOR_DELEGATE)
        elif wca_info['delegate_status'] in ('delegate', 'candidate_delegate'):
          user.roles.append(Roles.DELEGATE)

      # For local development, make it easier to make a user a global admin.
      if os.environ.get('ADMIN_WCA_ID'):
        user.roles = [role for role in user.roles if role != Roles.GLOBAL_ADMIN]
        if wca_info['wca_id'] and wca_info['wca_id'] in os.environ.get('ADMIN_WCA_ID'):
          user.roles.append(Roles.GLOBAL_ADMIN)

      if wca_info['wca_id']:
        wca_id_user = User.get_by_id(wca_info['wca_id'])
      else:
        wca_id_user = None
      if wca_id_user:
        if wca_id_user.city and not user.city:
          user.city = wca_id_user.city
        if wca_id_user.province and not user.province:
          user.province = wca_id_user.province
        if wca_id_user.latitude and not user.latitude:
          user.latitude = wca_id_user.latitude
        if wca_id_user.longitude and not user.longitude:
          user.longitude = wca_id_user.longitude
        wca_id_user.key.delete()

      user.last_login = datetime.datetime.now()

      user.put()
      address = get_secret('FLASK_ADDRESS')
      return redirect(address or '/')

  @bp.route('/logout')
  def logout():
    session.pop('wca_account_number', None)
    return redirect(request.referrer or '/')

  return bp