import datetime
import os
import logging
import requests

from flask import Blueprint, render_template, abort
from google.cloud import ndb

from backend.lib import common
from backend.models.championship import Championship
from backend.models.region import Region
from backend.models.province import Province
from backend.models.user import User

bp = Blueprint('regional', __name__)
client = ndb.Client()
