class TestUser:
    def __init__(self, id, wca_person_id="2020XXXX01", name="Test User", email="test@test.com", dob="01-01-2000",
                 roles=[],
                 province_id="QC"):
        self.id = id
        self.wca_person = TestWCAPerson(wca_person_id)
        self.name = name
        self.name_lower = name.lower()
        self.email = email
        self.dob = dob
        self.roles = roles
        self.province = TestProvince(province_id)
        self.key = None
        self.updates = []
        if id == 1:
            self.roles = ["DELEGATE"]  # This is a way to test for a user that has more rights.
        elif id == 0:
            self.roles = ["GLOBAL_ADMIN"]

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "roles": self.roles,
            "dob": self.dob,
            "province": self.province.id(),
            "wca_person": self.wca_person.id,
            "email": self.email,
        }

    def has_any_of_given_roles(self, roles):
        for role in self.roles:
            if role in roles:
                return True
        return False

    def put(self):
        pass

    def __ge__(self, other):
        return True


class TestProvince:
    def __init__(self, short, name="Quebec"):
        self.short = short
        self.name = name

    def id(self):
        return self.short


class TestWCAPerson:
    def __init__(self, id, province="QC"):
        self.id = id
        self.province = TestProvince(province)

    def get(self):
        return self

    def put(self):
        pass


class TestUserLocationUpdate:
    def __init__(self, province="QC"):
        self.province = TestProvince(province)
        self.updater = None
        self.update_time = "2023-08-25T02:12:24.141380Z"


testUpdate = TestUserLocationUpdate()
