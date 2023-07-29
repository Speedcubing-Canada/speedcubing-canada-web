import os

from google.cloud import secretmanager

def get_secret(name):
  if os.environ.get('ENV') == 'DEV':
    return os.environ.get(name)
  client = secretmanager.SecretManagerServiceClient()
  project_id = os.environ.get('GOOGLE_CLOUD_PROJECT')
  name = f"projects/{project_id}/secrets/{name}/versions/latest"
  response = client.access_secret_version(request={'name': name})
  return response.payload.data.decode('UTF-8')
