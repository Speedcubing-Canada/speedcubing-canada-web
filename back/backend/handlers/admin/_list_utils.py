"""Shared filter/sort/paginate helpers for react-admin list endpoints."""

from flask import request


def _sort_key(field):
    def key(record):
        value = record.get(field)
        # Keep None values together and comparable against real values.
        return (value is None, value)

    return key


def filter_and_sort(records, q, sort_field, sort_order, *, search_field, sort_fields, default_sort_field):
    """Filter by a case-insensitive substring match on ``search_field``, then sort."""
    if q:
        needle = q.lower()
        records = [r for r in records if needle in (r.get(search_field) or "").lower()]
    if sort_field not in sort_fields:
        sort_field = default_sort_field
    return sorted(records, key=_sort_key(sort_field), reverse=(sort_order.lower() == "desc"))


def parse_list_params(default_sort_field, default_sort_order="asc"):
    """Parse react-admin's page/per_page/sort/q query params."""
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = request.args.get("per_page", 25, type=int)
    if per_page < 1:
        per_page = 25
    sort_field = request.args.get("sort_field", default_sort_field).strip('"')
    sort_order = request.args.get("sort_order", default_sort_order).strip('"').lower()
    q = request.args.get("q", "", type=str).strip('"').strip()
    return page, per_page, sort_field, sort_order, q


def list_envelope(data, total, page, per_page):
    return {
        "data": data,
        "total": total,
        "pageInfo": {"hasPreviousPage": page > 1, "hasNextPage": page * per_page < total},
    }


def paginate_records(records, filter_and_sort_fn, *, default_sort_field, default_sort_order="asc"):
    """Filter/sort/slice an in-memory list per the request and return the react-admin list envelope."""
    page, per_page, sort_field, sort_order, q = parse_list_params(default_sort_field, default_sort_order)
    records = filter_and_sort_fn(records, q, sort_field, sort_order)
    start = (page - 1) * per_page
    return list_envelope(records[start : start + per_page], len(records), page, per_page)
