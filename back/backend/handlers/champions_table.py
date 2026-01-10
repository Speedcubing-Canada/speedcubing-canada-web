from flask import Blueprint, render_template
from google.cloud import ndb

from backend.lib import common
from backend.models.champion import Champion
from backend.models.region import Region
from backend.models.province import Province
from backend.models.wca.event import Event

bp = Blueprint('champions_table', __name__)
client = ndb.Client()

