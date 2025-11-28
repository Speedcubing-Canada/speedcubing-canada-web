from json import loads
from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.models.wca.person import Person
from backend.lib import auth
from backend.models.user import User, Roles

bp = Blueprint('show_users', __name__)
client = ndb.Client()
