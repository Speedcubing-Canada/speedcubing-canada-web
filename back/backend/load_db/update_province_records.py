import collections

from google.cloud import ndb

from backend.models.province import Province
from backend.models.wca.event import Event
from backend.models.wca.rank import RankAverage
from backend.models.wca.rank import RankSingle


def update_province_records():
    """Update province records for all events and provinces.
    
    This function identifies the best single and average results
    for each province in each event and marks them as province records.
    """
    province_records = []
    for rank_cls in (RankSingle, RankAverage):
        for evt in Event.query().fetch(keys_only=True):
            for province in Province.query().fetch(keys_only=True):
                current_time = None
                for rank in (rank_cls.query(ndb.AND(rank_cls.event == evt,
                                                   rank_cls.province == province))
                                      .order(rank_cls.best).iter()):
                    if current_time is None or rank.best == current_time:
                        rank.is_province_record = True
                        province_records += [rank]
                        current_time = rank.best
                    else:
                        break
    
    province_record_keys = [obj.key for obj in province_records]
    to_remove = []
    
    for rank_cls in (RankSingle, RankAverage):
        for record in rank_cls.query(rank_cls.is_province_record == True).iter():
            if record.key not in province_record_keys:
                record.is_province_record = False
                to_remove += [record]
    
    ndb.put_multi(province_records + to_remove)


if __name__ == '__main__':
    update_province_records()