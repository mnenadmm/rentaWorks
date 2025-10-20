# Ovde prosledjujemo blueprintove za rute
from .auth_routes import auth_bp
from .reference import reference_bp
from .korisnik_routes import korisnik_bp
from .firma_routes import firma_bp
from .oglasi_routes import oglasi_bp
from .chatGbt_routes import chat_gbt_bp
from .ocena_routes import ocena_bp
from .komentari_routes import komentari_bp
from .chat_routes import chat_bp 
def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(reference_bp, url_prefix='/api')
    app.register_blueprint(korisnik_bp, url_prefix='/api')
    app.register_blueprint(firma_bp, url_prefix='/api')
    app.register_blueprint(oglasi_bp, url_prefix='/api/oglasi')
    
    app.register_blueprint(ocena_bp, url_prefix='/api') 
    app.register_blueprint(komentari_bp, url_prefix='/api/komentari')
    # ChatGPT chat
    app.register_blueprint(chat_gbt_bp, url_prefix='/api/chatgpt')
    # Novi korisnik–korisnik chat
    app.register_blueprint(chat_bp, url_prefix='/api/chat')