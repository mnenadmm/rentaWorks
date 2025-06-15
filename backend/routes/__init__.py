# Ovde prosledjujemo blueprintove za rute
from .auth_routes import auth_bp
from .reference import reference_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(reference_bp)