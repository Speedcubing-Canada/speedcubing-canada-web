from google.cloud import ndb

from backend.models.user import User
from backend.models.wca.competition import Competition


class GroupStatus(ndb.Model):
    competition = ndb.KeyProperty(kind=Competition)
    group_id = ndb.IntegerProperty()
    ready_time = ndb.DateTimeProperty()
    ready_set_by = ndb.KeyProperty(kind=User)
    called_time = ndb.DateTimeProperty()
    called_by = ndb.KeyProperty(kind=User)

    @staticmethod
    def get_id(competition_id, group_id):
        return f'{competition_id}_{group_id}'


class CompetitionMetadata(ndb.Model):
    delay_minutes = ndb.IntegerProperty()
    message = ndb.StringProperty()
    refresh_ts = ndb.DateTimeProperty()
    image_url = ndb.StringProperty()