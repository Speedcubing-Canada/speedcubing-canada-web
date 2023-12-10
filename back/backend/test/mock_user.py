class TestUser:
    def __init__(self, id, wca_person="2020XXXX01", name="Test User", email="test@test.com", dob="01-01-2000", roles=[],
                 province="QC"):
        self.id = id
        self.wca_person = wca_person
        self.name = name
        self.email = email
        self.dob = dob
        self.roles = roles
        self.province = province
        if id == 1:
            self.roles = ["DELEGATE"]  # This is a way to test for a user that has more rights.

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "roles": self.roles,
            "dob": self.dob,
            "province": self.province,
            "wca_person": self.wca_person,
            "email": self.email,
        }

    def has_any_of_given_roles(self, roles):
        for role in self.roles:
            if role in roles:
                return True
        return False
