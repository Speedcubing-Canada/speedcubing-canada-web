from flask import Blueprint

from backend.handlers.admin.show_users import bp as show_users_bp
from backend.handlers.admin.provinces import bp as provinces_bp
from backend.handlers.admin.edit_championships import bp as edit_championships_bp

bp = Blueprint('admin', __name__, url_prefix='/admin')
bp.register_blueprint(show_users_bp)
bp.register_blueprint(provinces_bp)
bp.register_blueprint(edit_championships_bp)
