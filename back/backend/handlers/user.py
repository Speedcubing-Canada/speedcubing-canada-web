from flask import Blueprint, jsonify, request
from google.cloud import ndb
import datetime

from backend.lib import permissions, auth
from backend.models.province import Province
from backend.models.user import User, UserLocationUpdate
from backend.models.wca.rank import RankSingle, RankAverage

bp = Blueprint('user', __name__)
client = ndb.Client()

