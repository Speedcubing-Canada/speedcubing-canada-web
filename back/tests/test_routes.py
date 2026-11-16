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
    response = client.get("/api/user_info")
    assert response.status_code == 401
    assert response.json["error"] == "Unauthorized"


def test_user_info_returns_own_profile(as_user, make_user):
    user = make_user(2, name="Alex Tester")
    response = as_user(user).get("/api/user_info")
    assert response.status_code == 200
    assert response.json["id"] == "2"
    assert response.json["name"] == "Alex Tester"
    assert response.json["province"] == "qc"


def test_user_info_hides_other_users_from_a_plain_user(as_user, make_user):
    make_user(3, name="Someone Else")
    response = as_user(make_user(2)).get("/api/user_info/3")
    assert response.status_code == 403


def test_user_info_lets_a_delegate_see_another_user(as_user, make_user):
    make_user(3, name="Someone Else")
    response = as_user(make_user(2, roles=[Roles.DELEGATE])).get("/api/user_info/3")
    assert response.status_code == 200
    assert response.json["name"] == "Someone Else"


def test_get_users_forbidden_without_an_admin_role(client, as_user, make_user):
    assert client.get("/api/admin/get_users").status_code == 401
    assert as_user(make_user(2)).get("/api/admin/get_users").status_code == 403
    assert as_user(make_user(3, roles=[Roles.DELEGATE])).get("/api/admin/get_users").status_code == 403


def test_get_users_allowed_for_an_admin(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    response = as_user(admin).get("/api/admin/get_users")
    assert response.status_code == 200
    assert [u["name"] for u in response.json["data"]] == ["Admin User"]


def test_routes_are_served_under_api_only(client):
    assert client.get("/api/test_rankings").status_code == 200
    assert client.get("/test_rankings").status_code == 404


def _names(response):
    assert response.status_code == 200
    return [u["name"] for u in response.json["data"]]


def test_get_users_pages_go_both_ways(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    make_user(2, name="Bob Builder")
    make_user(3, name="Carol Cubes")
    client = as_user(admin)

    page1 = client.get("/api/admin/get_users?page=1&per_page=2")
    assert _names(page1) == ["Admin User", "Bob Builder"]
    assert page1.json["total"] == 3
    assert page1.json["pageInfo"] == {"hasPreviousPage": False, "hasNextPage": True}

    page2 = client.get("/api/admin/get_users?page=2&per_page=2")
    assert _names(page2) == ["Carol Cubes"]
    assert page2.json["pageInfo"] == {"hasPreviousPage": True, "hasNextPage": False}

    # Going back after going forward is the bug from issue #56.
    assert _names(client.get("/api/admin/get_users?page=1&per_page=2")) == ["Admin User", "Bob Builder"]


def test_get_users_sorts_by_requested_field(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    make_user(2, name="Bob Builder")
    client = as_user(admin)

    assert _names(client.get("/api/admin/get_users?sort_field=name&sort_order=desc")) == ["Bob Builder", "Admin User"]
    # react-admin's default sort is the record id, which is the key on the model.
    assert _names(client.get("/api/admin/get_users?sort_field=id&sort_order=DESC")) == ["Bob Builder", "Admin User"]


def test_get_users_filters_by_any_name_word(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    make_user(2, name="Alexandre Ondet")
    make_user(3, name="Anna Ann")
    client = as_user(admin)

    assert _names(client.get("/api/admin/get_users?q=ond")) == ["Alexandre Ondet"]
    assert _names(client.get("/api/admin/get_users?q=Alex")) == ["Alexandre Ondet"]
    assert _names(client.get("/api/admin/get_users?q=alexandre+on")) == ["Alexandre Ondet"]
    assert _names(client.get("/api/admin/get_users?q=ondet+alex")) == ["Alexandre Ondet"]
    assert _names(client.get("/api/admin/get_users?q=alexandre+zz")) == []
    # Two matching tokens on one entity must not produce a duplicate row.
    response = client.get("/api/admin/get_users?q=an")
    assert _names(response) == ["Anna Ann"]
    assert response.json["total"] == 1
    assert _names(client.get("/api/admin/get_users?q=zzz")) == []


def test_get_users_filtered_pages_have_totals(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    for i in range(2, 6):
        make_user(i, name=f"Cuber Number{i}")
    client = as_user(admin)

    page2 = client.get("/api/admin/get_users?q=cuber&page=2&per_page=3")
    assert _names(page2) == ["Cuber Number5"]
    assert page2.json["total"] == 4


def test_get_users_filters_by_wca_id_case_insensitively(as_user, make_user):
    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    make_user(2, name="Alexandre Ondet", wca_id="2017ONDE01")
    client = as_user(admin)

    response = client.get("/api/admin/get_users?q=2017onde01")
    assert _names(response) == ["Alexandre Ondet"]
    assert response.json["total"] == 1


def test_reindex_users_requires_admin_and_reports_count(client, as_user, make_user):
    assert client.post("/api/admin/reindex_users").status_code == 401
    assert as_user(make_user(2)).post("/api/admin/reindex_users").status_code == 403

    admin = make_user(1, name="Admin User", roles=[Roles.GLOBAL_ADMIN])
    response = as_user(admin).post("/api/admin/reindex_users")
    assert response.status_code == 200
    assert response.json == {"data": {"users": 2}}
