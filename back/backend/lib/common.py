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
    def __init__(self, wca_disclaimer=False):
        self.uri = request.path
        self.len = len
        self.formatters = formatters
        self.year = datetime.date.today().year
        self.user = auth.user()
        self.wca_disclaimer = wca_disclaimer

        if not self.user:
            return
        time_since_login = datetime.datetime.now() - self.user.last_login
        self.just_logged_in = time_since_login < datetime.timedelta(seconds=1)

    def uri_matches(self, path):
        return self.uri.endswith(path)

    def uri_matches_any(self, path_list):
        return any(self.uri_matches(path) for _, path in path_list)

    def wca_profile(self, wca_id):
        return f"https://www.worldcubeassociation.org/persons/{wca_id}"

    def format_date_range(self, start_date, end_date, include_year=True, full_months=False):
        month_fmt = "%B" if full_months else "%b"
        sm, em = start_date.strftime(month_fmt), end_date.strftime(month_fmt)

        year_chunk = f", {start_date.year}" if include_year else ""

        sd, ed = start_date.day, end_date.day

        if start_date == end_date:
            return f"{sm} {sd}{year_chunk}"

        if start_date.month == end_date.month:
            return f"{sm} {sd} &ndash; {ed}{year_chunk}"

        return f"{sm} {sd} &ndash; {em} {ed}{year_chunk}"

    @staticmethod
    def sort_events(events):
        return sorted(events, key=lambda evt: evt.get().rank)

    @staticmethod
    def all_provinces():
        return list(Province.query().order(Province.name).iter())

    @staticmethod
    def regions():
        return list(Region.query().order(Region.name).iter())

    @staticmethod
    def events(include_magic, include_mbo):
        return [e for e in Event.query().order(Event.rank).iter()
                if (include_magic or e.key.id() not in ['magic', 'mmagic']) and
                (include_mbo or e.key.id() != '333mbo')]

    @staticmethod
    def years():
        return reversed(range(2004, datetime.date.today().year + 2))

    @staticmethod
    def format_date(date):
        return f"{date.strftime('%B')} {date.day}, {date.year}"

    @staticmethod
    def is_string(h):
        return isinstance(h, str)

    @staticmethod
    def is_prod():
        return os.environ['ENV'] == 'PROD'

    @staticmethod
    def IconUrl(event_id):
        return f"/static/img/events/{event_id}.svg"

    @staticmethod
    def get_secret(name):
        return secrets.get_secret(name)

    @staticmethod
    def get_wca_export():
        val = get_latest_export()
        date_part = val.split('_')[-1][:8]
        return datetime.datetime.strptime(date_part, '%Y%m%d').strftime('%B %d, %Y').replace(' 0', ' ')
