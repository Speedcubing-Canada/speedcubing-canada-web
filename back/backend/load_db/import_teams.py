"""One-off bootstrap: import SCC teams and their members from the officers spreadsheet.

Export the officers Google Sheet
(https://docs.google.com/spreadsheets/d/1qZAEH93FfKqOO3gqJPVNPezUHKgBaM8pg2zetBEE4Js)
to CSV, then run this once to populate the ``Team`` kind. Teams are human-curated in
react-admin afterwards, so this is an idempotent upsert-by-slug (re-running with an updated
CSV is safe) modelled on ``setup_geography.py``. Directors and featured members are few and
editorial, so they're entered by hand in react-admin, not here.

The sheet has one row per person with columns:
    Name, Office(s), Region, WCA ID
``Office(s)`` is a comma-separated list, so a person can belong to several teams. ``WCA ID``
is optional (blank for members with no WCA account); bios and leader flags aren't in the
sheet and are added later in react-admin.

Run against the local emulator (from the ``back/`` directory):
    export PYTHONPATH=$(pwd)
    export DATASTORE_EMULATOR_HOST=localhost:8081 GOOGLE_CLOUD_PROJECT=scc-staging-391105
    ./scc/bin/python backend/load_db/import_teams.py --csv=exports/officers.csv
"""

import csv

from absl import app, flags, logging
from google.cloud import ndb

from backend.models.team import Team, TeamMember

FLAGS = flags.FLAGS

flags.DEFINE_string("csv", "exports/officers.csv", "Path to the officers CSV export.")

# Maps an "Office(s)" value from the sheet to a Team (stable slug + bilingual name). The
# order here also sets each team's display ``position``. Offices not listed here are skipped
# with a warning (e.g. a future "Software" team is created by hand in react-admin instead).
OFFICE_TEAMS = {
    "Communications": {
        "slug": "communications",
        "name_en": "Communications Team",
        "name_fr": "Équipe des communications",
    },
    "Events": {
        "slug": "events",
        "name_en": "Events Team",
        "name_fr": "Équipe des événements",
    },
    "Administrative": {
        "slug": "administration",
        "name_en": "Administration Team",
        "name_fr": "Équipe d'administration",
    },
}


def group_rows(rows):
    """Pivot the per-person sheet rows into per-team dicts. Pure (no datastore); testable.

    A person's ``Office(s)`` cell is split on commas, and they're added to each office's team.
    Rows without a name, and offices not in ``OFFICE_TEAMS``, are skipped.
    """
    positions = list(OFFICE_TEAMS)
    teams = {}
    for row in rows:
        name = (row.get("Name") or "").strip()
        if not name:
            continue
        wca_id = (row.get("WCA ID") or "").strip() or None
        offices = (row.get("Office(s)") or "").split(",")
        for office in (o.strip() for o in offices if o.strip()):
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
                    "description_en": None,
                    "description_fr": None,
                    "position": positions.index(office),
                    "members": [],
                }
                teams[slug] = team
            team["members"].append(
                {
                    "name": name,
                    "wca_id": wca_id,
                    "bio_en": None,
                    "bio_fr": None,
                    "is_leader": False,
                }
            )
    return teams


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


def import_teams_from_csv(path):
    """Read the officers CSV and upsert teams. Must run inside an active ndb context."""
    with open(path) as csvfile:
        rows = list(csv.DictReader(csvfile))
    grouped = group_rows(rows)
    count = upsert_teams(grouped)
    logging.info("Imported %d teams from %s", count, path)
    return count


def main(argv):
    del argv
    if not FLAGS.csv:
        raise app.UsageError("--csv is required")
    client = ndb.Client()
    with client.context():
        import_teams_from_csv(FLAGS.csv)


if __name__ == "__main__":
    app.run(main)
