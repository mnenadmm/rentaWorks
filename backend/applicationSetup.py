from flask import Flask
from flask import jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy # type: ignore
from extensions import db, migrate
from flask_migrate import upgrade # type: ignore
from konekcija import get_database_uri
from routes import register_blueprints
from administrator.routes import admin_bp
from flask_jwt_extended import JWTManager
from datetime import timedelta
from werkzeug.exceptions import RequestEntityTooLarge,HTTPException

def create_app():
    app = Flask(__name__)
    # CORS 
    CORS(app, supports_credentials=True)
    app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024 
    # JWT konfiguracijaa
    jwt = JWTManager(app)
    @app.errorhandler(RequestEntityTooLarge)
    def handle_large_file(error):
        return jsonify({'error': 'Fajl je prevelik. Maksimalna dozvoljena veličina je 20MB.'}), 413
    @jwt.unauthorized_loader
    def handle_missing_token(error_string):
        return jsonify({'error': 'Token nije prosleđen ili je neispravan.'}), 401
    @jwt.expired_token_loader
    def handle_expired_token(jwt_header, jwt_payload):
        return jsonify({'error': 'Token je istekao.'}), 401
    @jwt.invalid_token_loader
    def handle_invalid_token(error_string):
        return jsonify({'error': 'Token nije validan.'}), 401
    @jwt.revoked_token_loader
    def handle_revoked_token(jwt_header, jwt_payload):
        return jsonify({'error': 'Token je opozvan.'}), 401
    # Globalni error handler za neuhvaćene greške
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        if isinstance(error, HTTPException):
            # prepusti Flask-u da obradi HTTP greške (npr. 400, 404, itd.)
            return error
        app.logger.error(f"Neočekivana greška: {error}", exc_info=True)
        return jsonify({'error': 'Došlo je do greške na serveru.'}), 500


    app.config['JWT_SECRET_KEY'] = 'moj_tajni_kljuc'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
     
    
    # Baza
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['IMAGES_UPLOAD_FOLDER'] = './static/uploads' 

    db.init_app(app)
    migrate.init_app(app, db)

    # Blueprints
    register_blueprints(app)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    

    import modeli
    with app.app_context():
        upgrade()
   

    return app