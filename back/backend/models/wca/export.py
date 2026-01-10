from google.cloud import ndb


class LatestWcaExport(ndb.Model):
    export_id = ndb.StringProperty()


def get_latest_export():
    latest = LatestWcaExport.get_by_id('1')
    return latest.export_id if latest else None


def set_latest_export(export_id):
    latest = LatestWcaExport.get_by_id('1') or LatestWcaExport(id='1')
    latest.export_id = export_id
    latest.put()
