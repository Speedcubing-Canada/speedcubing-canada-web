"""Shared test fixtures.

Datastore is a real Cloud Datastore emulator, not a mock: mocks fight ndb's own
machinery, while the emulator gives real query, key and property-validation
semantics. Run one before pytest -- see tests/README.md. Tests that only exercise
pure helpers need none and keep using plain MagicMock.
"""

import datetime
import os
from unittest.mock import MagicMock

import pytest
import requests

EMULATOR_HOST = os.environ.setdefault("DATASTORE_EMULATOR_HOST", "localhost:8081")

# ENV=DEV makes get_secret() read the environment, so Secret Manager is never contacted.
os.environ.setdefault("ENV", "DEV")
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "test")
os.environ.setdefault("DATASTORE_PROJECT_ID", "test")
os.environ.setdefault("SESSION_SECRET_KEY", "testing")
os.environ.setdefault("FRONT_ADDRESS", "http://localhost:2003")
os.environ.setdefault("WCA_HOST", "https://www.worldcubeassociation.org")
os.environ.setdefault("WCA_CLIENT_ID", "test-client-id")
os.environ.setdefault("WCA_CLIENT_SECRET", "test-client-secret")

ME_WCA_ID = "2017ONDE01"


def _emulator_running():
    try:
        return requests.get(f"http://{EMULATOR_HOST}/", timeout=2).ok
    except requests.RequestException:
        return False


requires_emulator = pytest.mark.skipif(
    not _emulator_running(),
    reason=f"no datastore emulator on {EMULATOR_HOST} (see tests/README.md)",
)


@pytest.fixture(scope="session")
def ndb_client():
    from google.cloud import ndb

    return ndb.Client()


@pytest.fixture
def ndb_context(ndb_client):
    """An active ndb context, needed to build or validate keyed entities.

    Do not combine with the Flask ``client``: the handlers open their own context
    per request and ndb allows only one per thread.
    """
    with ndb_client.context():
        yield


@pytest.fixture
def datastore():
    """An empty datastore. The emulator's /reset drops every entity in one call."""
    requests.post(f"http://{EMULATOR_HOST}/reset", timeout=10).raise_for_status()


@pytest.fixture
def app(datastore):
    from backend.app import create_app

    flask_app = create_app()
    flask_app.config.update(TESTING=True)
    return flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def as_user(client):
    """Log a seeded user in by writing the session key the OAuth callback sets."""

    def _login(user):
        with client.session_transaction() as session:
            session["wca_account_number"] = user.key.id()
        return client

    return _login


@pytest.fixture
def seed(ndb_client, datastore):
    """Persist an entity inside a throwaway ndb context and return it."""

    def _seed(build):
        with ndb_client.context():
            entity = build()
            entity.put()
        return entity

    return _seed


# --- entity factories: only the fields the handlers read ---


@pytest.fixture
def make_region(seed):
    from backend.models.region import Region

    def _make(region_id="qc", name="Quebec", championship_name=None):
        return seed(lambda: Region(id=region_id, name=name, championship_name=championship_name or name))

    return _make


@pytest.fixture
def make_province(seed, make_region):
    from backend.models.province import Province

    def _make(province_id="qc", name="Quebec", region=None):
        # Resolve the parent before seed opens its context.
        region_key = (region or make_region()).key
        return seed(lambda: Province(id=province_id, name=name, region=region_key))

    return _make


@pytest.fixture
def make_user(seed, make_province):
    from google.cloud import ndb

    from backend.models.user import User
    from backend.models.wca.person import Person

    def _make(user_id, name="Test User", roles=None, province=None, email=None, wca_id=None):
        province_key = (province or make_province()).key
        # Production keys users by str(wca_account_number) -- see handlers/auth.py.
        user_id = str(user_id)
        return seed(
            lambda: User(
                id=user_id,
                name=name,
                email=email or f"user{user_id}@example.com",
                roles=roles or [],
                province=province_key,
                dob=datetime.date(2000, 1, 1),
                last_login=datetime.datetime(2026, 1, 1),
                wca_person=ndb.Key(Person, wca_id) if wca_id else None,
            ),
        )

    return _make


@pytest.fixture
def make_team(seed):
    from backend.models.team import Team, TeamMember

    def _make(team_id, leader_wca_id=None):
        return seed(
            lambda: Team(
                id=team_id,
                name_en="Software Team",
                name_fr="Software Team",
                members=[TeamMember(name="Lead", wca_id=leader_wca_id, is_leader=True)] if leader_wca_id else [],
            )
        )

    return _make


@pytest.fixture
def make_delegate(seed):
    from backend.models.delegate import Delegate

    def _make(wca_id, status="delegate"):
        return seed(lambda: Delegate(id=wca_id, name="Delegate", status=status))

    return _make


@pytest.fixture
def wca_login(app, client, monkeypatch):
    """Run the OAuth callback as if the WCA had returned ``me``; returns the response."""
    wca = app.extensions["authlib.integrations.flask_client"].wca
    monkeypatch.delenv("ADMIN_WCA_ID", raising=False)

    def _login(**me):
        me = {"id": 2, "wca_id": ME_WCA_ID, "name": "Test User", **me}
        monkeypatch.setattr(wca, "authorize_access_token", lambda: None)
        monkeypatch.setattr(wca, "get", lambda _path: MagicMock(json=lambda: {"me": me}))
        return client.get("/api/oauth_callback")

    return _login
