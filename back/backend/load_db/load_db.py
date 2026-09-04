import csv
import os

from absl import app, flags, logging
from backend.load_db.setup_geography import setup_regions_and_provinces
from backend.load_db.update_champions import update_champions
from backend.load_db.update_championships import update_championships
from backend.load_db.update_delegates import update_delegates
from backend.load_db.update_org_avatars import update_org_avatars
from backend.load_db.update_province_records import update_province_records
from backend.models.user import User
from backend.models.wca.competition import Competition
from backend.models.wca.continent import Continent
from backend.models.wca.country import Country
from backend.models.wca.event import Event
from backend.models.wca.export import set_latest_export
from backend.models.wca.format import Format
from backend.models.wca.person import Person
from backend.models.wca.rank import RankAverage, RankSingle
from backend.models.wca.result import Result
from backend.models.wca.round import RoundType
from google.cloud import ndb

FLAGS = flags.FLAGS

# Number of times an old .filtered cache was skipped this run because its
# columns no longer matched the model. Non-zero means a full reload happened
# for that table and someone should look into why the schema drifted.
_stale_cache_count = 0

flags.DEFINE_string("old_export_id", "", "ID of the old export.")
flags.DEFINE_string("new_export_id", "", "ID of the new export.")
flags.DEFINE_string("export_base", "", "Base directory of exports.")

flags.DEFINE_boolean("only_load_db", False, "Whether to only load the new database.")
flags.DEFINE_boolean("only_update_championships", False, "Whether to only update championships.")
flags.DEFINE_boolean("only_update_champions", False, "Whether to only update champions.")
flags.DEFINE_boolean("only_update_province_records", False, "Whether to only update province records.")
flags.DEFINE_boolean("only_update_delegates", False, "Whether to only update delegates.")
flags.DEFINE_boolean("only_update_org_avatars", False, "Whether to only update Organization-page avatars.")


def get_tables():
    return [
        ("continents", Continent, 1),
        ("countries", Country, 1),
        ("events", Event, 1),
        ("formats", Format, 1),
        ("round_types", RoundType, 1),
        ("persons", Person, 1),
        ("ranks_single", RankSingle, 5),
        ("ranks_average", RankAverage, 5),
        ("competitions", Competition, 5),
        ("results", Result, 10),
    ]


# Ideally this would live in person.py, but that would be a circular dependency
# between Person and User.
def get_modifier(table):
    if table == "persons":
        id_to_province = {}
        # The datastore emulator does not implement NOT_EQUAL, so filter in Python
        # there; the Users table is small enough for a full scan in dev.
        emulated = os.environ.get("DATASTORE_EMULATOR_HOST")
        for user in User.query() if emulated else User.query(User.province != None):
            if user.province and user.wca_person:
                id_to_province[user.wca_person.id()] = user.province

        def modify(person):
            if person.key.id() in id_to_province:
                person.province = id_to_province[person.key.id()]

        return modify
    return None


def read_table(path, cls, apply_filter, shard, shards):
    filter_fn = None
    if apply_filter:
        client = ndb.Client()
        with client.context():
            filter_fn = cls.filter()
    out = {}
    try:
        with open(path) as csvfile:
            reader = csv.DictReader(csvfile, dialect="excel-tab")
            # Guard against a stale/mismatched cache: if the (old) .filtered file
            # was written by an older build whose columns differ from what the
            # current model expects, treat it as empty rather than crashing. The
            # caller then re-puts every current row (idempotent) for one run, and
            # a fresh, correctly-formatted cache is written for the next run.
            required = set(cls.columns_used())
            if not required.issubset(reader.fieldnames or []):
                # STALE_CACHE_SKIPPED is a stable marker for log-based alerting.
                # We degrade to a full reload instead of crashing, but this is an
                # anomaly (usually a column rename) that must not pass unnoticed.
                logging.error(
                    "STALE_CACHE_SKIPPED: ignoring cache with mismatched columns %s (expected %s): %s",
                    reader.fieldnames,
                    sorted(required),
                    path,
                )
                global _stale_cache_count
                _stale_cache_count += 1
                return out
            for row in reader:
                # Check if filter_fn exists before calling it
                if filter_fn is None or filter_fn(row):
                    fields_to_write = cls.columns_used()
                    if "id" in row:
                        fields_to_write += ["id"]
                    to_write = {}
                    for field in fields_to_write:
                        if field in row:
                            to_write[field] = row[field]
                    row_id = cls.get_id(row)
                    if hash(row_id) % shards == shard:
                        out[row_id] = to_write
    except FileNotFoundError as e:
        # This is fine, the file might just not exist.
        logging.exception(e)
    return out


def write_table(path, rows, cls, shard):
    use_id = False
    with open(path) as csvfile:
        reader = csv.DictReader(csvfile, dialect="excel-tab")
        use_id = "id" in reader.fieldnames
    with open(path + ".filtered", "w" if shard == 0 else "a") as csvfile:
        fields_to_write = cls.columns_used()
        if use_id:
            fields_to_write += ["id"]
        writer = csv.DictWriter(csvfile, dialect="excel-tab", fieldnames=fields_to_write)
        if shard == 0:
            writer.writeheader()
        for row in rows.items():
            writer.writerow({k: v for k, v in row[1].items() if k in fields_to_write})


def process_export(old_export_path, new_export_path):
    client = ndb.Client()
    for table, cls, shards in get_tables():
        logging.info("Processing " + table)
        table_suffix = "/WCA_export_" + table + ".tsv"
        for shard in range(shards):
            logging.info("Shard %d/%d", shard + 1, shards)
            old_rows = read_table(old_export_path + table_suffix + ".filtered", cls, False, shard, shards)
            new_rows = read_table(new_export_path + table_suffix, cls, True, shard, shards)
            logging.info("Old: %d", len(old_rows))
            logging.info("New: %d", len(new_rows))
            write_table(new_export_path + table_suffix, new_rows, cls, shard)

            objects_to_put = []
            keys_to_delete = []

            modifier = None
            with client.context():
                modifier = get_modifier(table)
            for key in new_rows:
                row = new_rows[key]
                if key in old_rows and old_rows[key] == row:
                    continue
                with client.context():
                    obj = cls(id=key)
                    obj.parse_from_dict(row)
                    if modifier:
                        modifier(obj)
                    objects_to_put += [obj]
            for key in old_rows:
                if key in new_rows:
                    continue
                with client.context():
                    keys_to_delete += [ndb.Key(cls, key)]

            logging.info("Putting %d objects", len(objects_to_put))
            while objects_to_put:
                with client.context():
                    batch_size = 5000
                    logging.info("%d left", len(objects_to_put))
                    subslice = objects_to_put[:batch_size]
                    objects_to_put = objects_to_put[batch_size:]
                    ndb.put_multi(subslice)

            logging.info("Deleting %d objects", len(keys_to_delete))
            with client.context():
                ndb.delete_multi(keys_to_delete)


def main(argv):
    do_everything = (
        not FLAGS.only_load_db
        and not FLAGS.only_update_champions
        and not FLAGS.only_update_championships
        and not FLAGS.only_update_province_records
        and not FLAGS.only_update_delegates
        and not FLAGS.only_update_org_avatars
    )

    if do_everything or FLAGS.only_load_db:
        old_export_path = FLAGS.export_base + FLAGS.old_export_id
        new_export_path = FLAGS.export_base + FLAGS.new_export_id

        logging.info(old_export_path)
        logging.info(new_export_path)

        # A new client context is created for each write here, to avoid a memory leak.
        process_export(old_export_path, new_export_path)

        client = ndb.Client()
        with client.context():
            set_latest_export(FLAGS.new_export_id)

    client = ndb.Client()
    with client.context():
        if do_everything or FLAGS.only_update_championships:
            # Regions/provinces must be canonical and present before classification,
            # which matches competitions to regions by championship_name.
            setup_regions_and_provinces()
            update_championships()
        if do_everything or FLAGS.only_update_champions:
            update_champions()
        if do_everything or FLAGS.only_update_province_records:
            update_province_records()
        if do_everything or FLAGS.only_update_delegates:
            update_delegates()
        if do_everything or FLAGS.only_update_org_avatars:
            update_org_avatars()

    if _stale_cache_count:
        logging.error(
            "STALE_CACHE_SKIPPED: %d table(s) fell back to a full reload this run "
            "due to a mismatched cache; investigate a possible schema/column change.",
            _stale_cache_count,
        )


if __name__ == "__main__":
    app.run(main)
