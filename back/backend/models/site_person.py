from google.cloud import ndb


class _PersonRecord(ndb.Model):
    """Shared shape for a curated site person (board director / featured member).

    Keyed by an admin-chosen string slug so imports/upserts are idempotent. ``wca_id`` is
    optional and, when present, drives the WCA avatar + profile link on the public page.
    ``role_*`` is a bilingual title/description (board title, or "what they do/did for
    SCC"); ``bio_*`` an optional bilingual blurb; ``position`` orders the section.
    """

    name = ndb.StringProperty()
    wca_id = ndb.StringProperty()
    role_en = ndb.StringProperty()
    role_fr = ndb.StringProperty()
    bio_en = ndb.StringProperty()
    bio_fr = ndb.StringProperty()
    position = ndb.IntegerProperty(default=0)

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
        }


class Director(_PersonRecord):
    """A member of SCC's Board of Directors (rendered at the top of the Organization page)."""


class FeaturedMember(_PersonRecord):
    """A person featured on the Organization page for their contributions to SCC."""
