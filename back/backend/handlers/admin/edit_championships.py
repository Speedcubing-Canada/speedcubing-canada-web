from flask import abort, Blueprint, redirect, render_template, jsonify
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

