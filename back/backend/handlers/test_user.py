import google
import pytest

from backend.flask import create_app
from backend.lib.secrets import get_secret
from backend.test.mock_ndb_client import ndb_client
from backend.test.mock_user import TestUser

@pytest.fixture()
def app(mocker):
    mocker.patch("backend.flask.get_secret", return_value="testing")
    mocker.patch("google.cloud.ndb.Client", return_value=ndb_client)
    return create_app()


@pytest.fixture()
def client(app):
    return app.test_client()


def test_user_info(client):
    response = client.get("/user_info")
    assert b'{"error":"Unauthorized"}\n' in response.data


def test_modify_session(client, mocker):
    id = 46689
    mocker.patch("google.cloud.ndb.model.Model.get_by_id", return_value=TestUser(id))
    with client.session_transaction() as session:
        # set a user id without going through the login route
        session["wca_account_number"] = id
    response = client.get("/user_info")
    google.cloud.ndb.model.Model.get_by_id.assert_called_with(46689)
    assert response.json["id"] == 46689
