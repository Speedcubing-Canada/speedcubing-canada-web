from flask import Blueprint
from google.cloud import ndb

bp = Blueprint("edit_championships", __name__)
client = ndb.Client()
