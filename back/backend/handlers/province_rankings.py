from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.lib import common
from backend.models.province import Province
from backend.models.wca.event import Event
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle

bp = Blueprint('province_rankings', __name__)
client = ndb.Client()
