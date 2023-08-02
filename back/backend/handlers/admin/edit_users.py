from flask import abort, Blueprint, render_template
from google.cloud import ndb

from backend.lib import auth
from backend.lib.common import Common
from backend.models.user import Roles, User
from backend.models.wca.person import Person

bp = Blueprint('edit_users', __name__)
client = ndb.Client()

#@bp.route('/edit_users')
def edit_users():
  with client.context():
    me = auth.user()
    if not me or not me.HasAnyRole(Roles.AdminRoles()):
      abort(403)
    return render_template('admin/edit_users.html',
                           c=Common())

#@bp.route('/async/get_users/')
#@bp.route('/async/get_users/<filter_text>')
def edit_users_table(filter_text=''):
  with client.context():
    me = auth.user()
    if not me or not me.HasAnyRole(Roles.AdminRoles()):
      abort(403)

    if filter_text:
      users_to_show = User.query(ndb.OR(User.name == filter_text,
                                        User.city == filter_text,
                                        User.wca_person == ndb.Key(Person, filter_text)),
                                 order_by=[User.name]).fetch(30)
    else:
      users_to_show = User.query(order_by=[User.name]).fetch(30)

    return render_template('admin/edit_users_table.html',
                           c=Common(), users=users_to_show)
