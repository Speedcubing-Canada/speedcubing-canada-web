def test_get_users_403(client, client_as_normal_user, client_as_delegate):
    response = client.get("/admin/get_users")
    assert response.json["error"] == "Forbidden"
    assert response.status_code == 403

    response = client_as_normal_user.get("/admin/get_users")
    assert response.json["error"] == "Forbidden"
    assert response.status_code == 403

    response = client_as_delegate.get("/admin/get_users")
    assert response.json["error"] == "Forbidden"
    assert response.status_code == 403


def test_get_users(client_as_admin):
    response = client_as_admin.get("/admin/get_users")
    assert response.json["data"] == [
        {
            "id": "123",
            "name": "Test User",
            "roles": [],
            "dob": "01-01-2000",
            "province": "QC",
            "wca_person": "2020XXXX01",
            "email": "test@test.com",
        },
    ]
    assert response.json["cursor"] == ""
    assert response.json["pageInfo"] == {"hasNextPage": False, "hasPreviousPage": False}


def test_get_users_with_search(client_as_admin):
    response = client_as_admin.get('/admin/get_users?cursor=&filter={'
                                   '"q":"a"}&page=1&per_page=10&sort_field="id"&sort_order="ASC"')
    print(response.json)
    assert response.json["data"] == [
        {
            "id": "124",
            "name": "Test User",
            "roles": [],
            "dob": "01-01-2000",
            "province": "QC",
            "wca_person": "2020XXXX01",
            "email": "test@test.com",
        },
    ]
    assert response.json["cursor"] == ""
    assert response.json["pageInfo"] == {"hasNextPage": False, "hasPreviousPage": False}
