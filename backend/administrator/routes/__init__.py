from flask import Blueprint
from .images_routes import admin_images_bp

admin_bp = Blueprint('admin_bp', __name__)
admin_bp.register_blueprint(admin_images_bp)
