import pytest

from backend.flask import create_app
from backend.test.mock_ndb_client import ndb_client
from backend.test.mock_user import TestUser, TestProvince, testUpdate


@pytest.fixture()
def app(mocker):
    mocker.patch("backend.flask.get_secret", return_value="testing")
    mocker.patch("google.cloud.ndb.Client", return_value=ndb_client)
    mocker.patch("google.cloud.ndb.model.Model.get_by_id", side_effect=(lambda x: None if x == "100" else TestUser(x)))
    mocker.patch("google.cloud.ndb.Key", side_effect=(lambda x, y: TestProvince(y, x)))
    mocker.patch("google.cloud.ndb.Key.get", side_effect=(lambda x: x))
    mocker.patch("google.cloud.ndb.model.Model.put")
    mocker.patch("backend.handlers.user.rewrite_ranks")
    mocker.patch("backend.handlers.user.UserLocationUpdate", return_value=testUpdate)
    mocker.patch("google.cloud.ndb.Query.fetch", return_value=[TestUser("124")])
    mocker.patch("google.cloud.ndb.Query.fetch_page", return_value=([TestUser("123")], "", False))
    mocker.patch("google.cloud.ndb.Query.order", return_value=[])
    return create_app()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def client_as_normal_user(client):
    with client.session_transaction() as session:
        # set a user id without going through the login route
        session["wca_account_number"] = 2
    return client


@pytest.fixture()
def client_as_delegate(client):
    with client.session_transaction() as session:
        session["wca_account_number"] = 1
    return client


@pytest.fixture()
def client_as_admin(client):
    with client.session_transaction() as session:
        session["wca_account_number"] = 0
    return client
