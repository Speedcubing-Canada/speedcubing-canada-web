from google.cloud import ndb


class Region(ndb.Model):
    name = ndb.StringProperty()
    championship_name = ndb.StringProperty()
    obsolete = ndb.BooleanProperty()

