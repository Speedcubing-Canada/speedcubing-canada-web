import csv

from absl import app
from absl import flags
from absl import logging
from google.cloud import ndb

from backend.load_db.update_champions import update_champions
from backend.load_db.update_championships import update_championships
from backend.load_db.update_province_records import update_province_records
from backend.models.user import User
from backend.models.wca.competition import Competition
from backend.models.wca.continent import Continent
from backend.models.wca.country import Country
from backend.models.wca.event import Event
from backend.models.wca.export import set_latest_export
from backend.models.wca.format import Format
from backend.models.wca.person import Person
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle
from backend.models.wca.result import Result
from backend.models.wca.round import RoundType

FLAGS = flags.FLAGS

flags.DEFINE_string('old_export_id', '', 'ID of the old export.')
flags.DEFINE_string('new_export_id', '', 'ID of the new export.')
flags.DEFINE_string('export_base', '', 'Base directory of exports.')

flags.DEFINE_boolean('only_load_db', False, 'Whether to only load the new database.')
flags.DEFINE_boolean('only_update_championships', False, 'Whether to only update championships.')
flags.DEFINE_boolean('only_update_champions', False, 'Whether to only update champions.')
flags.DEFINE_boolean('only_update_province_records', False, 'Whether to only update province records.')


def get_tables():
    return [('Continents', Continent, 1),
            ('Countries', Country, 1),
            ('Events', Event, 1),
            ('Formats', Format, 1),
            ('RoundTypes', RoundType, 1),
            ('Persons', Person, 1),
            ('RanksSingle', RankSingle, 5),
            ('RanksAverage', RankAverage, 5),
            ('Competitions', Competition, 5),
            ('Results', Result, 10),
            ]


# Ideally this would live in person.py, but that would be a circular dependency
# between Person and User.
def get_modifier(table):
    if table == 'Persons':
        id_to_province = {}
        for user in User.query(User.province != None):
            if user.wca_person:
                id_to_province[user.wca_person.id()] = user.province

        def modify(person):
            if person.key.id() in id_to_province:
                person.province = id_to_province[person.key.id()]
        return modify
    return None


def read_table(path, cls, apply_filter, shard, shards):
    filter_fn = lambda row: True
    if apply_filter:
        client = ndb.Client()
        with client.context():
            filter_fn = cls.filter()
    out = {}
    try:
        with open(path) as csvfile:
            reader = csv.DictReader(csvfile, dialect='excel-tab')
            for row in reader:
                if filter_fn(row):
                    fields_to_write = cls.columns_used()
                    if 'id' in row:
                        fields_to_write += ['id']
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
        pass
    return out


def write_table(path, rows, cls, shard):
    use_id = False
    with open(path, 'r') as csvfile:
        reader = csv.DictReader(csvfile, dialect='excel-tab')
        use_id = 'id' in reader.fieldnames
    with open(path + '.filtered', 'w' if shard == 0 else 'a') as csvfile:
        fields_to_write = cls.columns_used()
        if use_id:
            fields_to_write += ['id']
        writer = csv.DictWriter(csvfile, dialect='excel-tab', fieldnames=fields_to_write)
        if shard == 0:
            writer.writeheader()
        for row in rows.items():
            writer.writerow({k: v for k, v in row[1].items() if k in fields_to_write})


def process_export(old_export_path, new_export_path):
    client = ndb.Client()
    for table, cls, shards in get_tables():
        logging.info('Processing ' + table)
        table_suffix = '/WCA_export_' + table + '.tsv'
        for shard in range(shards):
            logging.info('Shard %d/%d' % (shard + 1, shards))
            old_rows = read_table(old_export_path + table_suffix + '.filtered', cls, False, shard, shards)
            new_rows = read_table(new_export_path + table_suffix, cls, True, shard, shards)
            logging.info('Old: %d' % len(old_rows))
            logging.info('New: %d' % len(new_rows))
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
                else:
                    with client.context():
                        obj = cls(id=key)
                        obj.parse_from_dict(row)
                        if modifier:
                            modifier(obj)
                        objects_to_put += [obj]
            for key, row in old_rows.items():
                if key in new_rows:
                    continue
                else:
                    with client.context():
                        keys_to_delete += [ndb.Key(cls, key)]

            logging.info('Putting %d objects' % len(objects_to_put))
            while objects_to_put:
                with client.context():
                    batch_size = 5000
                    logging.info('%d left' % len(objects_to_put))
                    subslice = objects_to_put[:batch_size]
                    objects_to_put = objects_to_put[batch_size:]
                    ndb.put_multi(subslice)

            logging.info('Deleting %d objects' % len(keys_to_delete))
            with client.context():
                ndb.delete_multi(keys_to_delete)


def main(argv):
    do_everything = (
        not FLAGS.only_load_db and
        not FLAGS.only_update_champions and
        not FLAGS.only_update_championships and
        not FLAGS.only_update_province_records
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
            update_championships()
        if do_everything or FLAGS.only_update_champions:
            update_champions()
        if do_everything or FLAGS.only_update_province_records:
            update_province_records()


if __name__ == '__main__':
    app.run(main)
