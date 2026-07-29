"""One-off bootstrap: import SCC teams, members, and the Board of Directors from one CSV.

Export the officers Google Sheet
(https://docs.google.com/spreadsheets/d/1qZAEH93FfKqOO3gqJPVNPezUHKgBaM8pg2zetBEE4Js)
to CSV, then run this once to populate the ``Team`` and ``Director`` kinds. Everything is
human-curated in react-admin afterwards, so this is an idempotent upsert-by-slug (re-running
is safe) modelled on ``setup_geography.py``. Featured members are editorial and entered by
hand in react-admin, not here.

The CSV has one row per person with columns:
    Name, Office(s), Region, WCA ID, Leads
- ``Office(s)`` is a comma-separated list, so a person can belong to several teams. Each value
  maps to a team via ``OFFICE_TEAMS``; the special value ``Board`` makes the person a Director.
- ``WCA ID`` is optional (blank for people with no WCA account).
- ``Leads`` is a comma-separated list of the office(s) that person leads; it marks them as the
  team leader for those teams (blank for most people).
- ``Region`` is informational only (not imported).

Run against the local emulator (from the ``back/`` directory, with the ``scc`` venv active):
    export DATASTORE_EMULATOR_HOST=localhost:8081 GOOGLE_CLOUD_PROJECT=scc-staging-391105
    python backend/load_db/import_teams.py --csv=exports/officers.csv
"""

import csv
import os
import re
import sys

# Allow running directly (``python backend/load_db/import_teams.py`` from ``back/``) without
# setting PYTHONPATH: put the repo's ``back/`` dir on the path so ``backend`` is importable.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from absl import app, flags, logging  # noqa: E402
from google.cloud import ndb  # noqa: E402

from backend.models.person import Director  # noqa: E402
from backend.models.team import Team, TeamMember  # noqa: E402

FLAGS = flags.FLAGS

flags.DEFINE_string("csv", "exports/officers.csv", "Path to the officers CSV export.")

# Maps an "Office(s)" value from the sheet to a Team (stable slug + bilingual name). The order
# here also sets each team's display ``position``. Offices not listed here (other than the
# special "Board" value) are skipped with a warning.
# Order here sets each team's display ``position`` (see ``parse_rows``): Events is intentionally
# listed last since it has the most officers and is the least central to day-to-day operations.
OFFICE_TEAMS = {
    "Communications": {
        "slug": "communications",
        "name_en": "Communications Team",
        "name_fr": "Équipe des communications",
        "description_en": ("Runs SCC's social media, mailing lists, and outreach to keep the community informed."),
        "description_fr": ("Gère les réseaux sociaux, les listes de diffusion et les communications avec la communauté."),
    },
    "Software": {
        "slug": "software",
        "name_en": "Software Team",
        "name_fr": "Équipe logicielle",
        "description_en": "Builds and maintains the SCC website and others tools that support the speedcubing "
        "community accross Canada.",
        "description_fr": "Développe et entretient le site web de SCC ainsi que d'autres outils qui soutiennent "
        "la communauté du speedcubing à travers le Canada.",
    },
    "Administrative": {
        "slug": "administration",
        "name_en": "Administration Team",
        "name_fr": "Équipe d'administration",
        "description_en": "Handles SCC's governance, finances, and day-to-day operations as a non-profit.",
        "description_fr": (
            "S'occupe de la gouvernance, des finances et des opérations quotidiennes de SCC en tant "
            "qu'organisme à but non lucratif."
        ),
    },
    "Events": {
        "slug": "events",
        "name_en": "Events Team",
        "name_fr": "Équipe des événements",
        "description_en": ("Supports organizers running WCA competitions across Canada, from planning to competition day."),
        "description_fr": (
            "Accompagne les organisateurs de compétitions WCA partout au Canada, de la planification à la journée même."
        ),
    },
}

# Special "Office(s)" value routing a person to the Board of Directors (Director kind) instead
# of a Team.
BOARD_OFFICE = "Board"


def _member(name, wca_id, is_leader=False):
    return {"name": name, "wca_id": wca_id, "bio_en": None, "bio_fr": None, "is_leader": is_leader}


def _slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def parse_rows(rows):
    """Pivot the per-person rows into ``(teams, directors)``. Pure (no datastore); testable.

    Each person's ``Office(s)`` cell is comma-separated: office names map to teams (via
    ``OFFICE_TEAMS``) and the special ``Board`` office maps to a Director. ``Leads`` lists the
    office(s) that person leads, marking them the team leader there. Rows without a name, and
    unknown offices, are skipped.
    """
    positions = list(OFFICE_TEAMS)
    teams = {}
    directors = []
    seen_directors = set()
    for row in rows:
        name = (row.get("Name") or "").strip()
        if not name:
            continue
        wca_id = (row.get("WCA ID") or "").strip() or None
        offices = [o.strip() for o in (row.get("Office(s)") or "").split(",") if o.strip()]
        leads = {o.strip() for o in (row.get("Leads") or "").split(",") if o.strip()}
        for office in offices:
            if office == BOARD_OFFICE:
                slug = _slugify(name)
                if slug not in seen_directors:
                    seen_directors.add(slug)
                    directors.append({"id": slug, "name": name, "wca_id": wca_id, "position": len(directors)})
                continue
            config = OFFICE_TEAMS.get(office)
            if config is None:
                logging.warning("Unknown office %r for %s; skipping", office, name)
                continue
            slug = config["slug"]
            team = teams.get(slug)
            if team is None:
                team = {
                    "id": slug,
                    "name_en": config["name_en"],
                    "name_fr": config["name_fr"],
                    "description_en": config["description_en"],
                    "description_fr": config["description_fr"],
                    "position": positions.index(office),
                    "members": [],
                }
                teams[slug] = team
            team["members"].append(_member(name, wca_id, is_leader=(office in leads)))
    return teams, directors


def upsert_teams(grouped):
    """Upsert grouped team dicts into Datastore. Must run inside an active ndb context."""
    to_write = []
    for team_id, data in grouped.items():
        team = Team.get_by_id(team_id) or Team(id=team_id)
        team.name_en = data["name_en"]
        team.name_fr = data["name_fr"]
        team.description_en = data["description_en"]
        team.description_fr = data["description_fr"]
        team.position = data["position"]
        team.members = [TeamMember(**member) for member in data["members"]]
        to_write.append(team)
    ndb.put_multi(to_write)
    return len(to_write)


def upsert_directors(directors):
    """Upsert Board of Directors entries. Must run inside an active ndb context."""
    to_write = []
    for entry in directors:
        director = Director.get_by_id(entry["id"]) or Director(id=entry["id"])
        director.name = entry["name"]
        director.wca_id = entry["wca_id"]
        director.position = entry["position"]
        to_write.append(director)
    ndb.put_multi(to_write)
    return len(to_write)


def import_teams_from_csv(path):
    """Read the officers CSV and upsert teams + directors. Must run inside an active ndb context."""
    with open(path) as csvfile:
        rows = list(csv.DictReader(csvfile))
    teams, directors = parse_rows(rows)
    team_count = upsert_teams(teams)
    director_count = upsert_directors(directors)
    logging.info("Imported %d teams and %d directors from %s", team_count, director_count, path)
    return team_count, director_count


def main(argv):
    del argv
    if not FLAGS.csv:
        raise app.UsageError("--csv is required")
    client = ndb.Client()
    with client.context():
        import_teams_from_csv(FLAGS.csv)


if __name__ == "__main__":
    app.run(main)
