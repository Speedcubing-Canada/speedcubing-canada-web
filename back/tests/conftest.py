"""Shared test fixtures.

Datastore is a real Cloud Datastore emulator, not a mock. An earlier attempt
(the abandoned ``10_tests`` branch) tried patching a dozen ``google.cloud.ndb``
symbols and never got past the mocks fighting ndb's own machinery. The emulator
gives real query, key and property-validation semantics for free.

Run one before invoking pytest -- see tests/README.md. Tests that only exercise
pure helpers do not need it and keep using plain MagicMock.
"""

import datetime
import os

import pytest
import requests

EMULATOR_HOST = os.environ.setdefault("DATASTORE_EMULATOR_HOST", "localhost:8081")

# get_secret() reads straight from the environment when ENV=DEV, so the real
# Secret Manager is never contacted and needs no mocking.
os.environ.setdefault("ENV", "DEV")
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "test")
os.environ.setdefault("DATASTORE_PROJECT_ID", "test")
os.environ.setdefault("SESSION_SECRET_KEY", "testing")
os.environ.setdefault("FRONT_ADDRESS", "http://localhost:2003")
os.environ.setdefault("WCA_HOST", "https://www.worldcubeassociation.org")
os.environ.setdefault("WCA_CLIENT_ID", "test-client-id")
os.environ.setdefault("WCA_CLIENT_SECRET", "test-client-secret")


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
    """Persist an entity inside a throwaway ndb context and return it.

    The context is closed again before the caller gets control back, because the
    Flask handlers open their own and ndb permits only one per thread.
    """

    def _seed(build):
        with ndb_client.context():
            entity = build()
            entity.put()
        return entity

    return _seed


# --- entity factories -------------------------------------------------------
# Each factory writes inside its own short-lived context, so none is left open
# when the request runs. Only the fields the handlers actually read are set;
# add more as tests need them.


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
        # Resolve the parent before opening a context; ndb allows only one per thread.
        region_key = (region or make_region()).key
        return seed(lambda: Province(id=province_id, name=name, region=region_key))

    return _make


@pytest.fixture
def make_user(seed, make_province):
    from backend.models.user import User

    def _make(user_id, name="Test User", roles=None, province=None, email=None):
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
            ),
        )

    return _make
