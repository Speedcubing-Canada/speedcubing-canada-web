from google.cloud import ndb


class _PersonRecord(ndb.Model):
    """Shared shape for a curated site person (board director / featured member). Keyed by an
    admin-chosen string slug so imports/upserts are idempotent."""

    name = ndb.StringProperty()
    wca_id = ndb.StringProperty()
    role_en = ndb.StringProperty()
    role_fr = ndb.StringProperty()
    bio_en = ndb.StringProperty()
    bio_fr = ndb.StringProperty()
    position = ndb.IntegerProperty(default=0)
    # WCA avatar thumbnail synced server-side; "" = synced but default avatar,
    # None = not yet synced (frontend falls back to a client-side WCA fetch).
    avatar_thumb_url = ndb.StringProperty()

    def to_json(self):
        return {
            "id": self.key.id(),
            "name": self.name,
            "wca_id": self.wca_id,
            "role_en": self.role_en,
            "role_fr": self.role_fr,
            "bio_en": self.bio_en,
            "bio_fr": self.bio_fr,
            "position": self.position or 0,
            "avatar_thumb_url": self.avatar_thumb_url,
        }


class Director(_PersonRecord):
    """A member of SCC's Board of Directors (rendered at the top of the Organization page)."""


class FeaturedMember(_PersonRecord):
    """A person featured on the Organization page for their contributions to SCC."""
