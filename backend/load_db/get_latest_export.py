from google.cloud import ndb

from models.wca.export import get_latest_export

client = ndb.Client()

with client.context():
  export = get_latest_export()
  if export:
    print(export)
