from flask import Blueprint

from backend.handlers.admin.edit_users import bp as edit_users_bp
from backend.handlers.admin.provinces import bp as provinces_bp

bp = Blueprint('admin', __name__, url_prefix='/admin')
bp.register_blueprint(edit_users_bp)
bp.register_blueprint(provinces_bp)
