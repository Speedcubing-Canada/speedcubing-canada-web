from google.cloud import ndb

from models.wca.export import get_latest_export

client = ndb.Client()

# Delete classes we don't use anymore.
with client.context():
  for clsname in ['AppSettings',
                  'Document',
                  'Schedule',
                  'ScheduleCompetition',
                  'SchedulePerson',
                  'ScheduleRound',
                  'ScheduleStaff',
                  'ScheduleStage',
                  'ScheduleTimeBlock',
                  'WcaExport']:
    class MyModel(ndb.Model):
      pass

    MyModel.__name__ = clsname
    ndb.delete_multi(MyModel.query().fetch(keys_only=True))
