# Ovde prosledjujemo blueprintove za rute
from .auth_routes import auth_bp
from .reference import reference_bp
from .korisnik_routes import korisnik_bp
from .firma_routes import firma_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(reference_bp, url_prefix='/api')
    app.register_blueprint(korisnik_bp, url_prefix='/api')
    app.register_blueprint(firma_bp, url_prefix='/api')