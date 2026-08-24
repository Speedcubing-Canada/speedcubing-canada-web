import logging
import time

import requests
from backend.models.site_person import Director, FeaturedMember
from backend.models.team import Team
from google.cloud import ndb

logger = logging.getLogger(__name__)

_WCA_PERSON_URL = "https://www.worldcubeassociation.org/api/v0/persons/"

# ponytail: serial 1 req/s is plenty for ~30 people; batch/parallelize if the roster ever grows 10x.
_DELAY_SECONDS = 1


def _fetch_avatar(wca_id):
    """Fetch a person's avatar thumb URL from the WCA API.

    Returns the URL, "" for a default avatar (synced-but-no-photo sentinel), or
    None on any failure (meaning "leave the stored value alone" — never downgrade
    an existing avatar on a transient error).
    """
    try:
        resp = requests.get(_WCA_PERSON_URL + wca_id, timeout=30)
    except requests.RequestException:
        logger.exception("WCA person fetch failed for %s", wca_id)
        return None
    if resp.status_code != 200:
        logger.error("WCA person fetch returned %s for %s", resp.status_code, wca_id)
        return None

    avatar = (resp.json().get("person") or {}).get("avatar") or {}
    if avatar.get("is_default"):
        return ""
    return avatar.get("thumb_url") or ""


def update_org_avatars():
    """Sync WCA avatars for Organization-page people (team members, directors,
    featured members) into the datastore.

    Each person is independent: fetch failures skip that person and self-heal on
    the next nightly run, so there is no all-or-nothing abort. Must run inside an
    active ``ndb`` context (opened by ``load_db.main``).
    """
    teams = list(Team.query().iter())
    people = list(Director.query().iter()) + list(FeaturedMember.query().iter())

    wca_ids = {m.wca_id for t in teams for m in t.members if m.wca_id}
    wca_ids |= {p.wca_id for p in people if p.wca_id}

    avatars = {}
    for wca_id in sorted(wca_ids):
        result = _fetch_avatar(wca_id)
        if result is not None:
            avatars[wca_id] = result
        time.sleep(_DELAY_SECONDS)

    to_write = []
    for team in teams:
        changed = False
        for member in team.members:
            new = avatars.get(member.wca_id)
            if new is not None and member.avatar_thumb_url != new:
                member.avatar_thumb_url = new
                changed = True
        if changed:
            to_write.append(team)
    for person in people:
        new = avatars.get(person.wca_id)
        if new is not None and person.avatar_thumb_url != new:
            person.avatar_thumb_url = new
            to_write.append(person)

    ndb.put_multi(to_write)
    logger.info(
        "Synced avatars for %d of %d people (%d entities written).",
        len(avatars),
        len(wca_ids),
        len(to_write),
    )
