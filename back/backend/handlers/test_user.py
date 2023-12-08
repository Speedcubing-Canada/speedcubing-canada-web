import pytest
from flask import Flask

from backend.flask import create_app


@pytest.fixture()
def app():
    return create_app(is_testing=True)

@pytest.fixture()
def client(app):
    return app.test_client()


def test_user_info(client):
    response = client.get("/user_info")
    assert b'{"error":"Unauthorized"}\n' in response.data
