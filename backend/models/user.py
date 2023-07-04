from google.cloud import ndb

from backend.models.eligibility import RegionalChampionshipEligibility
from backend.models.eligibility import ProvinceChampionshipEligibility
from backend.models.province import Province
from backend.models.wca.person import Person


class Roles:
    GLOBAL_ADMIN = 'GLOBAL_ADMIN'
    DIRECTOR = 'DIRECTOR'
    WEBMASTER = 'WEBMASTER'
    SENIOR_DELEGATE = 'SENIOR_DELEGATE'
    DELEGATE = 'DELEGATE'
    CANDIDATE_DELEGATE = 'CANDIDATE_DELEGATE'

    @staticmethod
    def AllRoles():
        return [Roles.GLOBAL_ADMIN, Roles.DIRECTOR, Roles.WEBMASTER,
                Roles.SENIOR_DELEGATE, Roles.DELEGATE, Roles.CANDIDATE_DELEGATE]

    @staticmethod
    def DelegateRoles():
        return [Roles.SENIOR_DELEGATE, Roles.DELEGATE, Roles.CANDIDATE_DELEGATE]

    @staticmethod
    def AdminRoles():
        return [Roles.GLOBAL_ADMIN, Roles.DIRECTOR, Roles.WEBMASTER]


class UserLocationUpdate(ndb.Model):
    city = ndb.StringProperty()
    province = ndb.KeyProperty(kind=Province)

    update_time = ndb.DateTimeProperty()
    # Defined at end of file (it's a circular reference so we can't define here)
    # updater = ndb.KeyProperty(kind=User)


class User(ndb.Model):
    wca_person = ndb.KeyProperty(kind=Person)
    name = ndb.StringProperty()
    email = ndb.StringProperty()
    dob = ndb.DateProperty()
    roles = ndb.StringProperty(repeated=True)

    province = ndb.KeyProperty(kind=Province)

    last_login = ndb.DateTimeProperty()

    updates = ndb.StructuredProperty(UserLocationUpdate, repeated=True)
    regional_eligibilities = ndb.StructuredProperty(RegionalChampionshipEligibility, repeated=True)
    province_eligibilities = ndb.StructuredProperty(ProvinceChampionshipEligibility, repeated=True)

    def HasAnyRole(self, roles):
        for role in self.roles:
            if role in roles:
                return True
        return False


UserLocationUpdate.updater = ndb.KeyProperty(kind=User)
UserLocationUpdate._fix_up_properties()