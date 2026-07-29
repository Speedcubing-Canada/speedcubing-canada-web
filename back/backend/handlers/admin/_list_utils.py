"""Shared filter/sort helper for react-admin list endpoints.

Every admin list endpoint (championships, teams, people) does the same thing over its own
``to_json()`` dicts: substring-filter on one field, then sort by a whitelisted field, falling
back to a default when the requested one isn't sortable. Only the field names differ per
resource, so those are the only things each caller needs to supply.
"""


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
