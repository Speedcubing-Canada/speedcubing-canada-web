from backend.handlers.admin.edit_championships import bp as edit_championships_bp
from backend.handlers.admin.edit_directors import bp as edit_directors_bp
from backend.handlers.admin.edit_featured_members import bp as edit_featured_members_bp
from backend.handlers.admin.edit_teams import bp as edit_teams_bp
from backend.handlers.admin.provinces import bp as provinces_bp
from backend.handlers.admin.show_users import bp as show_users_bp
from flask import Blueprint

bp = Blueprint("admin", __name__, url_prefix="/admin")
bp.register_blueprint(show_users_bp)
bp.register_blueprint(provinces_bp)
bp.register_blueprint(edit_championships_bp)
bp.register_blueprint(edit_teams_bp)
bp.register_blueprint(edit_directors_bp)
bp.register_blueprint(edit_featured_members_bp)
