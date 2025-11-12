from google.cloud import ndb

from backend.models.user import User
from backend.models.wca.competition import Competition


class GroupStatus(ndb.Model):
    """Status tracking for competition groups.
    
    Tracks when groups are ready to compete and when they are called.
    """
    competition = ndb.KeyProperty(kind=Competition)
    group_id = ndb.IntegerProperty()
    ready_time = ndb.DateTimeProperty()
    ready_set_by = ndb.KeyProperty(kind=User)
    called_time = ndb.DateTimeProperty()
    called_by = ndb.KeyProperty(kind=User)

    @staticmethod
    def get_id(competition_id, group_id):
        """Generate a unique ID for a group status."""
        return '%s_%d' % (competition_id, group_id)


class CompetitionMetadata(ndb.Model):
    """Additional metadata for competitions.
    
    Stores competition-specific information like delays, messages, and display settings.
    """
    delay_minutes = ndb.IntegerProperty()
    message = ndb.StringProperty()
    refresh_ts = ndb.DateTimeProperty()
    image_url = ndb.StringProperty()