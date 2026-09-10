"""End-to-end route tests through the Flask test client and a real datastore emulator.

These are the first tests to exercise the actual request path -- blueprint
registration, the session cookie, the permission decorators and ndb queries --
rather than calling handler helpers directly. Adding a route here is now just a
new function; the harness lives in conftest.py.
"""

from backend.models.user import Roles
from tests.conftest import requires_emulator

pytestmark = requires_emulator


def test_user_info_requires_login(client):
    response = client.get("/user_info")
    assert response.status_code == 401
    assert response.json["error"] == "Unauthorized"


def test_user_info_returns_own_profile(as_user, make_user):
    user = make_user(2, name="Alex Tester")
    response = as_user(user).get("/user_info")
    assert response.status_code == 200
    assert response.json["id"] == "2"
    assert response.json["name"] == "Alex Tester"
    assert response.json["province"] == "qc"


def test_user_info_hides_other_users_from_a_plain_user(as_user, make_user):
    make_user(3, name="Someone Else")
    response = as_user(make_user(2)).get("/user_info/3")
    assert response.status_code == 403


def test_user_info_lets_a_delegate_see_another_user(as_user, make_user):
    make_user(3, name="Someone Else")
    response = as_user(make_user(2, roles=[Roles.DELEGATE])).get("/user_info/3")
    assert response.status_code == 200
    assert response.json["name"] == "Someone Else"


def test_get_users_forbidden_without_an_admin_role(client, as_user, make_user):
    assert client.get("/admin/get_users").status_code == 401
    assert as_user(make_user(2)).get("/admin/get_users").status_code == 403
    assert as_user(make_user(3, roles=[Roles.DELEGATE])).get("/admin/get_users").status_code == 403


def test_get_users_allowed_for_an_admin(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    response = as_user(admin).get("/admin/get_users")
    assert response.status_code == 200
    assert [u["name"] for u in response.json["data"]] == ["Admin User"]


def test_every_route_is_served_at_both_mounts(client):
    """DispatcherMiddleware serves the legacy api.* paths and the same-origin /api ones."""
    assert client.get("/test_rankings").json == client.get("/api/test_rankings").json
