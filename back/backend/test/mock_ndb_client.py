from unittest import mock
from google.cloud.ndb import context as context_module

from backend.test.mock_user import TestUser

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


class TestQuery:
    def __init__(self):
        pass
    def fetch(self):
        return [TestUser("124")]

    def order(self, *args):
        return self

    def fetch_page(self, per_page, start_cursor):
        return [TestUser("123")], "", False
