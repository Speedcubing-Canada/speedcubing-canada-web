from backend.models.wca.export import get_latest_export
from google.cloud import ndb

client = ndb.Client()

with client.context():
    export = get_latest_export()
    if export:
        print(export)
