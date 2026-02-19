from flask import Blueprint
from google.cloud import ndb


bp = Blueprint("champions_table", __name__)
client = ndb.Client()
