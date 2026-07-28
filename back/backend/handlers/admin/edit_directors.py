from backend.handlers.admin._person_crud import make_person_blueprint
from backend.models.person import Director

bp = make_person_blueprint("edit_directors", "director", "directors", Director)
