import logging
import os
import sys

from dotenv import load_dotenv
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