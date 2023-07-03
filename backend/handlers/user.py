import datetime

from flask import Blueprint, render_template, redirect, request, jsonify
from google.cloud import ndb

from backend.lib import auth
from backend.lib import permissions
from backend.lib.common import Common
from backend.models.province import Province
from backend.models.user import User, Roles, UserLocationUpdate
from backend.models.wca.rank import RankAverage, RankSingle

bp = Blueprint('user', __name__)
client = ndb.Client()

# After updating the user's province, write the RankSingle and RankAverage to the
# datastore again to update their provinces.
def RewriteRanks(wca_person):
  if not wca_person:
    return
  for rank_class in (RankSingle, RankAverage):
    ndb.put_multi(rank_class.query(rank_class.person == wca_person.key).fetch())

def error(msg):
  return render_template('error.html', c=Common(), error=msg)

@bp.route('/me')
def me():
  with client.context():
    me = auth.user()
    if not me:
      return jsonify({"error": "Unauthorized"}), 401
    return jsonify({
        "id": me.key.id(),
        "name": me.name,
        "roles": me.roles,
        "city": me.city,
        "province": me.province.id() if me.province else None,
        "wca_person": me.wca_person.id() if me.wca_person else None
    })


@bp.route('/edit', methods=['GET', 'POST'])
@bp.route('/edit/<user_id>', methods=['GET', 'POST'])
def edit_user(user_id=-1):
  with client.context():
    me = auth.user()
    if not me:
      return redirect('/')
    if user_id == -1:
      user = me
    else:
      user = User.get_by_id(user_id)
    if not user:
      return error('Unrecognized user ID %d' % user_id)
    if not permissions.CanViewUser(user, me):
      return error('You\'re not authorized to view this user.')

    if request.method == 'GET':
      return render_template('edit_user.html',
                             c=Common(),
                             user=user,
                             all_roles=Roles.AllRoles(),
                             editing_location_enabled=permissions.CanEditLocation(user, me),
                             can_view_roles=permissions.CanViewRoles(user, me),
                             editable_roles=permissions.EditableRoles(user, me),
                             successful=request.args.get('successful', 0))

    city = request.form['city']
    province_id = request.form['province']
    if province_id == 'empty':
      province_id = ''

    if request.form['lat'] and request.form['lng']:
      lat = int(request.form['lat'])
      lng = int(request.form['lng'])
    else:
      lat = 0
      lng = 0
    template_dict = {}

    old_province_id = user.province.id() if user.province else ''
    changed_location = user.city != city or old_province_id != province_id
    user_modified = False
    if permissions.CanEditLocation(user, me) and changed_location:
      if city:
        user.city = city
      else:
        del user.city
      if province_id:
        user.province = ndb.Key(Province, province_id)
      else:
        del user.province
      if user.wca_person and old_province_id != province_id:
        wca_person = user.wca_person.get()
        if wca_person:
          wca_person.province = user.province
          wca_person.put()
        RewriteRanks(wca_person)
      user.latitude = lat
      user.longitude = lng
      user_modified = True

      if changed_location:
        # Also save the Update.
        update = UserLocationUpdate()
        update.updater = me.key
        if city:
          update.city = city
        update.update_time = datetime.datetime.now()
        if province_id:
          update.province = ndb.Key(Province, province_id)
        user.updates.append(update)

    elif changed_location:
      return error('You\'re not authorized to edit user locations.')

    for role in permissions.EditableRoles(user, me):
      if role in request.form and role not in user.roles:
        user.roles.append(role)
        user_modified = True
      elif role not in request.form and role in user.roles:
        user.roles.remove(role)
        user_modified = True

    if user_modified:
      user.put()

    return redirect(request.path + '?successful=1')