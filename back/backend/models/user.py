from google.cloud import ndb

from backend.models.eligibility import ProvinceChampionshipEligibility, RegionalChampionshipEligibility
from backend.models.province import Province
from backend.models.wca.person import Person


class Roles:
    GLOBAL_ADMIN = "GLOBAL_ADMIN"
    WEBMASTER = "WEBMASTER"
    DIRECTOR = "DIRECTOR"
    COMMS = "COMMS"
    SENIOR_DELEGATE = "SENIOR_DELEGATE"
    DELEGATE = "DELEGATE"
    TRAINEE_DELEGATE = "TRAINEE_DELEGATE"

    @staticmethod
    def AllRoles():
        return [Roles.GLOBAL_ADMIN, Roles.WEBMASTER, Roles.DIRECTOR, Roles.COMMS] + Roles.DelegateRoles()

    @staticmethod
    def DelegateRoles():
        return [Roles.SENIOR_DELEGATE, Roles.DELEGATE, Roles.TRAINEE_DELEGATE]

    @staticmethod
    def GrantableRoles():
        """Hand-grantable roles below GLOBAL_ADMIN; delegate roles are synced from the roster at login."""
        return [Roles.WEBMASTER, Roles.DIRECTOR, Roles.COMMS]

    @staticmethod
    def SiteAdminRoles():
        return [Roles.GLOBAL_ADMIN, Roles.WEBMASTER]

    @staticmethod
    def ContentRoles():
        return Roles.SiteAdminRoles() + [Roles.DIRECTOR, Roles.COMMS]


class UserLocationUpdate(ndb.Model):
    province = ndb.KeyProperty(kind=Province)

    update_time = ndb.DateTimeProperty()
    # Defined at end of file (it's a circular reference so we can't define here)
    # updater = ndb.KeyProperty(kind=User)


class User(ndb.Model):
    wca_person = ndb.KeyProperty(kind=Person)
    name = ndb.StringProperty()
    # Datastore cannot substring-match; the admin search prefix-matches each word instead.
    name_tokens = ndb.ComputedProperty(lambda self: (self.name or "").lower().split(), repeated=True)
    email = ndb.StringProperty()
    dob = ndb.DateProperty()
    roles = ndb.StringProperty(repeated=True)

    province = ndb.KeyProperty(kind=Province)

    last_login = ndb.DateTimeProperty()

    updates = ndb.StructuredProperty(UserLocationUpdate, repeated=True)
    regional_eligibilities = ndb.StructuredProperty(RegionalChampionshipEligibility, repeated=True)
    province_eligibilities = ndb.StructuredProperty(ProvinceChampionshipEligibility, repeated=True)

    def has_any_of_given_roles(self, roles):
        return bool(set(self.roles) & set(roles))

    def to_json(self):
        # Residency history (province changes), most-recent-first, so an admin can
        # debug championship eligibility (resolved as of a deadline) from the UI.
        updates = sorted(
            (u for u in self.updates if u.update_time),
            key=lambda u: u.update_time,
            reverse=True,
        )
        return {
            "id": self.key.id(),
            "name": self.name,
            "roles": self.roles,
            "dob": self.dob.isoformat() if self.dob else None,
            "province": self.province.id() if self.province else None,
            "wca_id": self.wca_person.id() if self.wca_person else None,
            "email": self.email,
            "updates": [
                {
                    "province": u.province.id() if u.province else None,
                    "update_time": u.update_time.isoformat(),
                }
                for u in updates
            ],
        }


UserLocationUpdate.updater = ndb.KeyProperty(kind=User)
UserLocationUpdate._fix_up_properties()
