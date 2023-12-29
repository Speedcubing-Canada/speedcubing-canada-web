import datetime
import os

from flask import request

from backend.lib import formatters, auth, secrets
from backend.models.region import Region
from backend.models.province import Province
from backend.models.user import Roles
from backend.models.wca.event import Event
from backend.models.wca.export import get_latest_export


class Common(object):
    current_date = datetime.datetime.now()

    def __init__(self, wca_disclaimer=False):
        self.uri = request.path
        self.len = len
        self.formatters = formatters
        self.year = datetime.date.today().year
        self.user = auth.user()
        self.wca_disclaimer = wca_disclaimer

        if self.user:
            time_since_login = datetime.datetime.now() - self.user.last_login
            if time_since_login < datetime.timedelta(seconds=1):
                self.just_logged_in = True

    def uri_matches(self, path):
        return self.uri.endswith(path)

    def uri_matches_any(self, path_list):
        for text, path in path_list:
            if self.uri_matches(path):
                return True
        return False

    def wca_profile(self, wca_id):
        return f"https://www.worldcubeassociation.org/persons/{wca_id}"

    def format_date_range(self, start_date, end_date, include_year=True, full_months=False):
        year_chunk = ', %d' % start_date.year if include_year else ''
        month_format = lambda date: date.strftime('%B' if full_months else '%b')
        if start_date == end_date:
            return '%s %d%s' % (month_format(start_date), start_date.day, year_chunk)
        elif start_date.month == end_date.month:
            return '%s %d &ndash; %d%s' % (month_format(start_date), start_date.day,
                                           end_date.day, year_chunk)
        else:
            return '%s %d &ndash; %s %d%s' % (month_format(start_date), start_date.day,
                                              month_format(end_date), end_date.day,
                                              year_chunk)

    def sort_events(self, events):
        return sorted(events, key=lambda evt: evt.get().rank)

    def all_provinces(self):
        return [province for province in Province.query().order(Province.name).iter()]

    def regions(self):
        return [r for r in Region.query().order(Region.name).iter()]

    def events(self, include_magic, include_mbo):
        return [e for e in Event.query().order(Event.rank).iter()
                if (include_magic or e.key.id() not in ['magic', 'mmagic']) and
                (include_mbo or e.key.id() != '333mbo')]

    def years(self):
        return reversed(range(2004, datetime.date.today().year + 2))

    def format_date(self, date):
        return '%s %d, %d' % (date.strftime('%B'), date.day, date.year)

    def is_string(self, h):
        return type(h) is str

    def is_none(self, h):
        return h is None

    def is_prod(self):
        return os.environ['ENV'] == 'PROD'

    def IconUrl(self, event_id):
        return f"/static/img/events/{event_id}.svg"

    def get_secret(self, name):
        return secrets.get_secret(name)

    def get_wca_export(self):
        val = get_latest_export()
        date_part = val.split('_')[-1][:8]
        return datetime.datetime.strptime(date_part, '%Y%m%d').strftime('%B %d, %Y').replace(' 0', ' ')
