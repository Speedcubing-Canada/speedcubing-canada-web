from flask import Blueprint
from google.cloud import ndb

from backend.lib.permissions import require_roles
from backend.load_db.setup_geography import setup_regions_and_provinces
from backend.models.user import Roles

bp = Blueprint("provinces", __name__)
client = ndb.Client()


@bp.route("/update_provinces")
@require_roles(Roles.GLOBAL_ADMIN, Roles.WEBMASTER)
def update_provinces():
    # require_roles already opens an ndb context.
    setup_regions_and_provinces()
    return "ok"
