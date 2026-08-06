"""Shared react-admin CRUD for the flat "site person" kinds (see ``models/site_person.py``)."""

from backend.handlers.admin._list_utils import filter_and_sort as _filter_and_sort
from backend.handlers.admin._list_utils import paginate_records
from backend.lib.permissions import require_roles
from backend.models.user import Roles
from flask import Blueprint, jsonify, request
from google.cloud import ndb

_SORT_FIELDS = ("id", "name", "role_en", "position")
_PERSON_FIELDS = ("name", "wca_id", "role_en", "role_fr", "bio_en", "bio_fr")


def apply_person_fields(record, data):
    """Set a person record's editable fields from a react-admin payload."""
    for field in _PERSON_FIELDS:
        value = data.get(field)
        setattr(record, field, value.strip() if isinstance(value, str) and value.strip() else None)
    record.position = int(data.get("position") or 0)


def filter_and_sort(records, q, sort_field, sort_order):
    """Filter by name substring then sort. Pure helper for testing."""
    return _filter_and_sort(
        records, q, sort_field, sort_order, search_field="name", sort_fields=_SORT_FIELDS, default_sort_field="position"
    )


def make_person_blueprint(name, singular, plural, model):
    """Build a Blueprint exposing the full react-admin CRUD contract for ``model``."""
    bp = Blueprint(name, __name__)

    @bp.route(f"/get_{plural}")
    @require_roles(*Roles.AdminRoles())
    def list_records():
        records = [r.to_json() for r in model.query().iter()]
        return jsonify(paginate_records(records, filter_and_sort, default_sort_field="position"))

    @bp.route(f"/get_{plural}_by_id")
    @require_roles(*Roles.AdminRoles())
    def get_records_by_id():
        raw_ids = request.args.get("ids", "[]", type=str).strip("[]").split(",")
        ids = [i.strip().strip('"') for i in raw_ids if i.strip()]
        records = [r for r in ndb.get_multi([ndb.Key(model, i) for i in ids]) if r]
        return jsonify({"data": [r.to_json() for r in records]})

    @bp.route(f"/{singular}/<record_id>")
    @require_roles(*Roles.AdminRoles())
    def get_record(record_id):
        record = model.get_by_id(record_id)
        if not record:
            return jsonify({"error": f"{singular} not found"}), 404
        return jsonify(record.to_json())

    @bp.route(f"/{plural}", methods=["POST"])
    @require_roles(*Roles.AdminRoles())
    def create_record():
        data = request.get_json() or {}
        record_id = (data.get("id") or "").strip()
        if not record_id:
            return jsonify({"error": "An id (slug) is required"}), 400
        if model.get_by_id(record_id):
            return jsonify({"error": f"{record_id} already exists"}), 409
        record = model(id=record_id)
        apply_person_fields(record, data)
        record.put()
        return jsonify(record.to_json())

    @bp.route(f"/{plural}/<record_id>", methods=["POST"])
    @require_roles(*Roles.AdminRoles())
    def update_record(record_id):
        record = model.get_by_id(record_id)
        if not record:
            return jsonify({"error": f"{singular} not found"}), 404
        apply_person_fields(record, request.get_json() or {})
        record.put()
        return jsonify(record.to_json())

    @bp.route(f"/{plural}/<record_id>", methods=["DELETE"])
    @require_roles(*Roles.AdminRoles())
    def delete_record(record_id):
        record = model.get_by_id(record_id)
        if not record:
            return jsonify({"error": f"{singular} not found"}), 404
        record.key.delete()
        return jsonify({"data": {"id": record_id}})

    return bp
