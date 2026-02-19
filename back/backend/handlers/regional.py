from flask import Blueprint
from google.cloud import ndb


bp = Blueprint("regional", __name__)
client = ndb.Client()
