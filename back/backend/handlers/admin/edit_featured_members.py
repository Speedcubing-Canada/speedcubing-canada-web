from backend.handlers.admin._person_crud import make_person_blueprint
from backend.models.site_person import FeaturedMember

bp = make_person_blueprint("edit_featured_members", "featured_member", "featured_members", FeaturedMember)
