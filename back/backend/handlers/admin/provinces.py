from flask import abort, Blueprint, jsonify
from google.cloud import ndb

from backend.lib import auth
from backend.models.region import Region
from backend.models.province import Province
from backend.models.user import Roles

bp = Blueprint('provinces', __name__)
client = ndb.Client()
