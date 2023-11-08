import datetime
import os

from flask import Blueprint, url_for, redirect, request, session
from google.cloud import ndb

from backend.lib.secrets import get_secret
from backend.models.user import User, Roles
from backend.models.wca.person import Person
from backend.models.wca.rank import RankSingle, RankAverage

client = ndb.Client()

def create_bp(oauth):
  bp = Blueprint('auth', __name__)

  

  return bp