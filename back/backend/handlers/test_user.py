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


def test_user_info_401(client):
    response = client.get("/user_info")
    assert response.json["error"] == "Unauthorized"
    assert response.status_code == 401


def test_user_info_own_info(client, mocker):
    id = 46689
    mocker.patch("google.cloud.ndb.model.Model.get_by_id", return_value=TestUser(id))
    with client.session_transaction() as session:
        # set a user id without going through the login route
        session["wca_account_number"] = id
    response = client.get("/user_info")
    google.cloud.ndb.model.Model.get_by_id.assert_called_with(46689)
    assert response.json["id"] == 46689
    assert response.json["name"] == "Test User"
    assert response.json["roles"] == []
    assert response.json["dob"] == "01-01-2000"
    assert response.json["province"] == "QC"
    assert response.json["wca_person"] == "2020XXXX01"
    assert response.json["email"] == "test@test.com"


def test_user_info_403(client, mocker):
    mocker.patch("google.cloud.ndb.model.Model.get_by_id", side_effect=lambda x: TestUser(x))
    with client.session_transaction() as session:
        session["wca_account_number"] = 46689
    response = client.get("/user_info/123")
    assert response.json["error"] == "You're not authorized to view this user."
    assert response.status_code == 403


def test_user_info_as_delegate(client, mocker):
    mocker.patch("google.cloud.ndb.model.Model.get_by_id", side_effect=lambda x: TestUser(x))
    with client.session_transaction() as session:
        session["wca_account_number"] = 1
    response = client.get("/user_info/123")
    assert response.json["id"] == "123"
    assert response.json["name"] == "Test User"
    assert response.json["roles"] == []
    assert response.json["dob"] == "01-01-2000"
    assert response.json["province"] == "QC"
    assert response.json["wca_person"] == "2020XXXX01"
    assert response.json["email"] == "test@test.com"


def test_user_info_404(client, mocker):
    mocker.patch("google.cloud.ndb.model.Model.get_by_id", side_effect=(lambda x: None if x == "100" else TestUser(x)))
    with client.session_transaction() as session:
        session["wca_account_number"] = 1
    response = client.get("/user_info/100")
    assert response.json["error"] == "Unrecognized user ID 100"
    assert response.status_code == 404
