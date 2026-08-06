from backend.models.province import Province
from backend.models.region import Region
from backend.models.wca.competition import Competition
from google.cloud import ndb


class Championship(ndb.Model):
    national_championship = ndb.BooleanProperty()
    region = ndb.KeyProperty(kind=Region)
    province = ndb.KeyProperty(kind=Province)

    competition = ndb.KeyProperty(kind=Competition)
    is_pbq = ndb.BooleanProperty()
    is_fmc = ndb.BooleanProperty()

    year = ndb.ComputedProperty(lambda self: self.competition.get().year)

    residency_deadline = ndb.DateTimeProperty()
    residency_timezone = ndb.StringProperty()

    @staticmethod
    def nationals_id(year: int, is_fmc: bool = False) -> str:
        suffix = "_fmc" if is_fmc else ""
        return f"{year}{suffix}"

    @staticmethod
    def regionals_id(year: int, region: Region, is_pbq: bool = False) -> str:
        suffix = "_pbq" if is_pbq else ""
        return f"{region.key.id()}_{year}{suffix}"

    @staticmethod
    def province_championship_id(year: int, province: Province, is_pbq: bool = False) -> str:
        suffix = "_pbq" if is_pbq else ""
        return f"{province.key.id()}_{year}{suffix}"

    def get_eligible_province_keys(self) -> list[ndb.Key] | None:
        if self.province:
            return [self.province]
        if self.region:
            return Province.query(Province.region == self.region).fetch(keys_only=True)
        # National championships are not based on residence, they're based on
        # citizenship.
        return None

    def type_and_area(self, regions=None, provinces=None):
        """Return ``(type, area)`` for this championship.

        ``type`` is one of ``national``, ``national_fmc``, ``regional``,
        ``provincial`` or ``unknown``. ``area`` is the human-readable region
        championship name / province name (``None`` for national). ``regions`` and
        ``provinces`` are optional ``{key: entity}`` lookups so callers serializing
        many championships can avoid a datastore round-trip per row.
        """
        if self.national_championship:
            return ("national_fmc" if self.is_fmc else "national"), None
        if self.region:
            region = regions.get(self.region) if regions is not None else self.region.get()
            return "regional", region.championship_name if region else None
        if self.province:
            province = provinces.get(self.province) if provinces is not None else self.province.get()
            return "provincial", province.name if province else None
        return "unknown", None

    def to_json(self, regions=None, provinces=None, competition=None):
        """Serialize to a react-admin-friendly record.

        ``competition`` may be passed in to avoid a per-row datastore fetch when
        serializing many championships.
        """
        if competition is None and self.competition:
            competition = self.competition.get()
        champ_type, area = self.type_and_area(regions, provinces)
        return {
            "id": self.key.id(),
            "type": champ_type,
            "area": area,
            "national_championship": bool(self.national_championship),
            "region": self.region.id() if self.region else None,
            "province": self.province.id() if self.province else None,
            "competition_id": self.competition.id() if self.competition else None,
            "competition_name": competition.name if competition else None,
            "year": competition.year if competition else None,
            "is_pbq": bool(self.is_pbq),
            "is_fmc": bool(self.is_fmc),
            "residency_deadline": self.residency_deadline.isoformat() if self.residency_deadline else None,
            "residency_timezone": self.residency_timezone,
        }
