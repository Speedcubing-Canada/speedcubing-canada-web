from google.cloud import ndb


class TeamMember(ndb.Model):
    """A member of an SCC team (nested inside :class:`Team`).

    ``wca_id`` is optional: when present it drives the WCA avatar + profile link on the
    public Organization page; when absent the member renders as a plain (non-linked) card.
    ``bio_en``/``bio_fr`` are optional. ``is_leader`` marks the team lead (not every team
    has one).
    """

    name = ndb.StringProperty()
    wca_id = ndb.StringProperty()
    bio_en = ndb.StringProperty()
    bio_fr = ndb.StringProperty()
    is_leader = ndb.BooleanProperty(default=False)

    def to_json(self):
        return {
            "name": self.name,
            "wca_id": self.wca_id,
            "bio_en": self.bio_en,
            "bio_fr": self.bio_fr,
            "is_leader": bool(self.is_leader),
        }


class Team(ndb.Model):
    """An SCC team (Software, Communications, ...) and its members.

    Keyed by an admin-chosen string slug (e.g. ``"software"``) so imports/upserts are
    idempotent, matching :class:`Championship`'s string-id convention. Human-curated via
    react-admin (``TeamsAdmin``) and served publicly by ``handlers/teams.py``. Names and
    descriptions are bilingual; ``position`` orders teams on the page.
    """

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
