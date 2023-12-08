from unittest import mock
from google.cloud.ndb import context as context_module

ndb_client = mock.Mock(
    project="testing",
    database=None,
    namespace=None,
    stub=mock.Mock(spec=()),
    spec=("project", "namespace", "database", "stub"),
)


def context():
    return context_module.Context(ndb_client).use()


ndb_client.context = context
