from google.cloud import ndb


class Delegate(ndb.Model):
    """A WCA Delegate serving the Canada region.

    Keyed by WCA id. Synced from the WCA ``user_roles`` API by
    ``load_db/update_delegates.py`` and served publicly by ``handlers/delegates.py``.
    Delegate membership is defined by the WCA delegate region (Canada East/West), not
    by nationality, so non-Canadian delegates who serve Canada are included.
    """

    name = ndb.StringProperty()
    # WCA gender ("m" | "f" | "o"); used to pick gendered labels (e.g. French "déléguée").
    gender = ndb.StringProperty()
    # regional_delegate | senior_delegate | delegate | junior_delegate | trainee_delegate
    status = ndb.StringProperty()
    # 2-letter province id (qc, on, ...); None for regional delegates (no province).
    province = ndb.StringProperty()
    # WCA delegate-region group name, e.g. "Canada (East)" / "Canada (West)".
    region_group = ndb.StringProperty()
    # WCA avatar thumbnail; None when the delegate has the default avatar.
    avatar_thumb_url = ndb.StringProperty()

    def to_json(self):
        return {
            "wca_id": self.key.id(),
            "name": self.name,
            "gender": self.gender,
            "status": self.status,
            "province": self.province,
            "region_group": self.region_group,
            "avatar_thumb_url": self.avatar_thumb_url,
        }
