from flask import abort, Blueprint, redirect, render_template
from google.cloud import ndb

from backend.lib import auth, common
from backend.models.championship import Championship
from backend.models.region import Region
from backend.models.province import Province
from backend.models.user import Roles
from backend.models.wca.competition import Competition
from backend.models.wca.country import Country

bp = Blueprint('edit_championships', __name__)
client = ndb.Client()


#@bp.route('/add_championship/<competition_id>/<championship_type>')
def add_championship(competition_id, championship_type):
    with client.context():
        me = auth.user()
        if not me or not me.HasAnyRole(Roles.AdminRoles()):
            abort(403)
        competition = Competition.get_by_id(competition_id)
        if championship_type == 'national':
            championship_id = Championship.nationals_id(competition.year)
        elif championship_type == 'regional':
            championship_id = Championship.regionals_id(competition.year,
                                                        competition.province.get().region.get())
        elif championship_type == 'province':
            championship_id = Championship.province_championship_id(competition.year,
                                                                    competition.province.get())
        championship = (Championship.get_by_id(championship_id) or
                        Championship(id=championship_id))

        if championship_type == 'national':
            championship.national_championship = True
        elif championship_type == 'regional':
            championship.region = competition.province.get().region
        elif championship_type == 'province':
            championship.province = competition.province
        championship.competition = competition.key
        championship.put()
        # TODO: if we changed a championship we should update champions and eligibilities.
        return redirect('/admin/edit_championships')


#@bp.route('/delete_championship/<championship_id>')
def delete_championship(championship_id):
    with client.context():
        me = auth.user()
        if not me or not me.HasAnyRole(Roles.AdminRoles()):
            abort(403)
        championship = Championship.get_by_id(championship_id)
        championship.key.delete()
        # TODO: if we changed a championship we should update champions and eligibilities.
        return redirect('/admin/edit_championships')


#@bp.route('/edit_championships')
def edit_championships():
    with client.context():
        me = auth.user()
        if not me or not me.HasAnyRole(Roles.AdminRoles()):
            abort(403)

        all_us_competitions = (
            Competition.query(Competition.country == ndb.Key(Country, 'Canada'))
            .order(Competition.name)
            .fetch())

        national_championships = (
            Championship.query(Championship.national_championship == True)
            .order(-Championship.year)
            .fetch())
        regional_championships = (
            Championship.query(Championship.region != None)
            .order(Championship.region)
            .order(-Championship.year)
            .fetch())
        province_championships = (
            Championship.query(Championship.province != None)
            .order(Championship.province)
            .order(-Championship.year)
            .fetch())

        provinces = Province.query().fetch()
        regions = Region.query().fetch()

        return render_template('admin/edit_championships.html',
                               c=common.Common(),
                               all_us_competitions=all_us_competitions,
                               national_championships=national_championships,
                               regional_championships=regional_championships,
                               province_championships=province_championships,
                               provinces=provinces,
                               regions=regions)