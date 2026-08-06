import logging
import re

import requests
from backend.models.delegate import Delegate
from backend.models.province import PROVINCE_NAME_TO_ID
from google.cloud import ndb

logger = logging.getLogger(__name__)

_WCA_USER_ROLES_URL = "https://www.worldcubeassociation.org/api/v0/user_roles"

# WCA delegate-region groups for Canada are named "Canada (East)" / "Canada (West)".
# The senior super-region "USA & Canada" is intentionally excluded.
_CANADA_GROUP_PREFIX = "Canada"

_PAGE_SIZE = 100

# Most senior first: a person holding several roles is shown at their highest rank.
_STATUS_PRIORITY = [
    "senior_delegate",
    "regional_delegate",
    "delegate",
    "junior_delegate",
    "trainee_delegate",
]

_LOCATION_RE = re.compile(r"Canada \((.+)\)")


def _province_id_from_location(location):
    """Map a WCA delegate ``location`` ("Canada (Quebec)") to a 2-letter province id.

    Returns None for regional delegates (no location) or unrecognized provinces.
    """
    if not location:
        return None
    match = _LOCATION_RE.match(location)
    if not match:
        return None
    return PROVINCE_NAME_TO_ID.get(match.group(1))


def _pick_status(statuses):
    """Pick the most senior status from the set of roles a single person holds."""
    for status in _STATUS_PRIORITY:
        if status in statuses:
            return status
    # Fall back to any status if the WCA introduces one we don't rank yet.
    return next(iter(statuses), None)


def _delegates_from_roles(roles):
    """Collapse raw WCA roles into ``{wca_id: entry}`` for Canada-region delegates.

    A person can hold several roles (e.g. a regional_delegate role with no location
    plus a delegate role with a province); merge them into one entry per WCA id,
    keeping every status seen (for _pick_status), the first province found, and a
    non-default avatar.
    """
    by_id = {}
    for role in roles:
        group = role.get("group") or {}
        if not (group.get("name") or "").startswith(_CANADA_GROUP_PREFIX):
            continue
        user = role.get("user") or {}
        wca_id = user.get("wca_id")
        if not wca_id:
            continue

        metadata = role.get("metadata") or {}
        entry = by_id.setdefault(
            wca_id,
            {
                "name": user.get("name"),
                "gender": user.get("gender"),
                "statuses": set(),
                "province": None,
                "region_group": group.get("name"),
                "avatar_thumb_url": None,
            },
        )

        status = metadata.get("status")
        if status:
            entry["statuses"].add(status)

        province = _province_id_from_location(metadata.get("location"))
        if province and not entry["province"]:
            entry["province"] = province

        avatar = user.get("avatar") or {}
        if not avatar.get("is_default") and not entry["avatar_thumb_url"]:
            entry["avatar_thumb_url"] = avatar.get("thumb_url")

    return by_id


def _fetch_roles():
    """Fetch every active delegate-region role from the WCA API (paginated).

    Returns the full list, or None if any page fails (so the caller can skip the sync
    rather than act on a partial roster).
    """
    roles = []
    page = 1
    while True:
        try:
            resp = requests.get(
                _WCA_USER_ROLES_URL,
                params={
                    "isActive": "true",
                    "groupType": "delegate_regions",
                    "isGroupHidden": "false",
                    "per_page": _PAGE_SIZE,
                    "page": page,
                },
                timeout=30,
            )
        except requests.RequestException:
            logger.exception("WCA user_roles fetch failed on page %s", page)
            return None
        if resp.status_code != 200:
            logger.error("WCA user_roles fetch returned %s on page %s", resp.status_code, page)
            return None

        chunk = resp.json()
        if not chunk:
            break
        roles.extend(chunk)
        if len(chunk) < _PAGE_SIZE:
            break
        page += 1

    return roles


def update_delegates():
    """Sync the Canada-region WCA delegate roster into the datastore.

    Idempotent upsert-by-WCA-id plus prune of anyone no longer a delegate. Must run
    inside an active ``ndb`` context (opened by ``load_db.main``). Mirrors the
    ``update_championships`` / ``setup_geography`` step pattern.
    """
    roles = _fetch_roles()
    if roles is None:
        logger.error("Skipping delegate sync; WCA API unavailable.")
        return

    by_id = _delegates_from_roles(roles)
    if not by_id:
        # Never wipe the roster on an empty/anomalous response.
        logger.error("Skipping delegate sync; WCA returned no Canada-region delegates.")
        return

    to_write = []
    for wca_id, entry in by_id.items():
        delegate = Delegate.get_by_id(wca_id) or Delegate(id=wca_id)
        delegate.name = entry["name"]
        delegate.gender = entry["gender"]
        delegate.status = _pick_status(entry["statuses"])
        delegate.province = entry["province"]
        delegate.region_group = entry["region_group"]
        delegate.avatar_thumb_url = entry["avatar_thumb_url"]
        to_write.append(delegate)
    ndb.put_multi(to_write)

    stale = [d.key for d in Delegate.query().iter() if d.key.id() not in by_id]
    if stale:
        ndb.delete_multi(stale)

    logger.info("Synced %d delegates (%d pruned).", len(to_write), len(stale))
