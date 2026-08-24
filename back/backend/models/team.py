from google.cloud import ndb


class TeamMember(ndb.Model):
    """A member of an SCC team (nested inside :class:`Team`). ``wca_id`` is optional."""

    name = ndb.StringProperty()
    wca_id = ndb.StringProperty()
    bio_en = ndb.StringProperty()
    bio_fr = ndb.StringProperty()
    is_leader = ndb.BooleanProperty(default=False)
    # WCA avatar thumbnail synced server-side; "" = synced but default avatar,
    # None = not yet synced (frontend falls back to a client-side WCA fetch).
    avatar_thumb_url = ndb.StringProperty()

    def to_json(self):
        return {
            "name": self.name,
            "wca_id": self.wca_id,
            "bio_en": self.bio_en,
            "bio_fr": self.bio_fr,
            "is_leader": bool(self.is_leader),
            "avatar_thumb_url": self.avatar_thumb_url,
        }


class Team(ndb.Model):
    """An SCC team (Software, Communications, ...) and its members. Keyed by an admin-chosen
    string slug (e.g. ``"software"``) so imports/upserts are idempotent."""

    name_en = ndb.StringProperty()
    name_fr = ndb.StringProperty()
    description_en = ndb.StringProperty()
    description_fr = ndb.StringProperty()
    position = ndb.IntegerProperty(default=0)
    members = ndb.StructuredProperty(TeamMember, repeated=True)

    def to_json(self):
        return {
            "id": self.key.id(),
            "name_en": self.name_en,
            "name_fr": self.name_fr,
            "description_en": self.description_en,
            "description_fr": self.description_fr,
            "position": self.position or 0,
            "members": [member.to_json() for member in self.members],
        }
