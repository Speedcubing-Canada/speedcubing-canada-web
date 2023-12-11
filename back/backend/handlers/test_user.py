from unittest.mock import MagicMock

import google
import pytest

from backend.flask import create_app
from backend.test.mock_ndb_client import ndb_client
from backend.test.mock_user import TestUser, TestProvince, TestUserLocationUpdate, testUpdate


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


def test_user_info_401(client):
    response = client.get("/user_info")
    assert response.json["error"] == "Unauthorized"
    assert response.status_code == 401


def test_user_info_own_info(client_as_normal_user):
    response = client_as_normal_user.get("/user_info")
    google.cloud.ndb.model.Model.get_by_id.assert_called_with(2)
    assert response.json["id"] == 2
    assert response.json["name"] == "Test User"
    assert response.json["roles"] == []
    assert response.json["dob"] == "01-01-2000"
    assert response.json["province"] == "QC"
    assert response.json["wca_person"] == "2020XXXX01"
    assert response.json["email"] == "test@test.com"


def test_user_info_403(client_as_normal_user):
    response = client_as_normal_user.get("/user_info/123")
    assert response.json["error"] == "You're not authorized to view this user."
    assert response.status_code == 403


def test_user_info_as_delegate(client_as_delegate):
    response = client_as_delegate.get("/user_info/123")
    assert response.json["id"] == "123"
    assert response.json["name"] == "Test User"
    assert response.json["roles"] == []
    assert response.json["dob"] == "01-01-2000"
    assert response.json["province"] == "QC"
    assert response.json["wca_person"] == "2020XXXX01"
    assert response.json["email"] == "test@test.com"


def test_user_info_404(client_as_delegate):
    response = client_as_delegate.get("/user_info/100")
    assert response.json["error"] == "Unrecognized user ID 100"
    assert response.status_code == 404


def test_edit_401(client):
    response = client.post("/edit")
    assert response.json["error"] == "Unauthorized"
    assert response.status_code == 401


def test_edit_own_info(client_as_normal_user):
    response = client_as_normal_user.post("/edit", json={"province": "on"})
    assert response.json["id"] == 2
    assert response.json["name"] == "Test User"
    assert response.json["roles"] == []
    assert response.json["dob"] == "01-01-2000"
    assert response.json["province"] == "on"
    assert response.json["wca_person"] == "2020XXXX01"
    assert response.json["email"] == "test@test.com"


def test_edit_own_info_400(client_as_normal_user):
    response = client_as_normal_user.post("/edit", json={"province": "onn"})
    assert response.json["error"] == "Invalid province ID onn"
    assert response.status_code == 400


def test_edit_403(client_as_normal_user):
    response = client_as_normal_user.post("/edit/123", json={"province": "on"})
    assert response.json["error"] == "You're not authorized to view this user. So you can't edit their location either."
    assert response.status_code == 403
