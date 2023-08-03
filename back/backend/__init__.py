import datetime
import logging
import os
import sys

from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from flask import Flask, redirect, request
from flask_cors import CORS
import google.cloud.logging

from backend.lib.secrets import get_secret

if os.path.exists('.env.dev'):
    load_dotenv('.env')

if os.environ.get('ENV') == 'PROD':
    client = google.cloud.logging.Client()
    client.setup_logging()
elif os.environ.get('ENV') == 'DEV' and 'gunicorn' in sys.argv[0]:
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

app = Flask(__name__)
app.secret_key = get_secret('SESSION_SECRET_KEY')
app.permanent_session_lifetime = datetime.timedelta(days=7)
address = get_secret('FRONT_ADDRESS')
CORS(app, supports_credentials=True)


@app.before_request
def before_request():
    is_changed = False
    if request.url.endswith('/'):
        url = request.url[:-1]
        is_changed = True
    if os.environ.get('ENV') == 'PROD' and not request.is_secure:
        url = request.url.replace('http://', 'https://', 1)
        is_changed = True
    if is_changed:
        code = 301
        return redirect(url, code=code)


wca_host = os.environ.get('WCA_HOST')
oauth = OAuth(app)
oauth.register(
    name='wca',
    client_id=get_secret('WCA_CLIENT_ID'),
    client_secret=get_secret('WCA_CLIENT_SECRET'),
    access_token_url=wca_host + '/oauth/token',
    access_token_params=None,
    authorize_url=wca_host + '/oauth/authorize',
    authorize_params=None,
    api_base_url=wca_host + '/api/v0/',
    token_endpoint_auth_method='client_secret_post',
    client_kwargs={'scope': 'public email dob'},
)

from backend.handlers.admin import bp as admin_bp
from backend.handlers.auth import create_bp as create_auth_bp
from backend.handlers.champions_table import bp as champions_table_bp
from backend.handlers.regional import bp as regional_bp
from backend.handlers.province_rankings import bp as province_rankings_bp
from backend.handlers.user import bp as user_bp

app.register_blueprint(admin_bp)
app.register_blueprint(create_auth_bp(oauth))
app.register_blueprint(champions_table_bp)
app.register_blueprint(regional_bp)
app.register_blueprint(province_rankings_bp)
app.register_blueprint(user_bp)
