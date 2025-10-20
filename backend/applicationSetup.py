from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from extensions import db, migrate
from flask_migrate import upgrade  # type: ignore
from konekcija import get_database_uri
from routes import register_blueprints
#ovo je chatGbt
import cohere
#Uvozimo socket evente za chatGBt
from routes.chatGbt_routes import  registar_eventa_za_chatGBT
import os
from administrator.routes import admin_bp
from flask_jwt_extended import JWTManager
from datetime import timedelta
from werkzeug.exceptions import RequestEntityTooLarge, HTTPException
from extensions import socketio


def create_app():
    app = Flask(__name__)

    # Siguran CORS samo  frontend origin-e
    # ✅ Dozvoljeni frontend domeni
    allowed_origins = ["http://5.75.164.111:4200", "http://localhost:4200"]
    # ✅ CORS konfiguracija
    CORS(app,
         supports_credentials=True,
         origins=allowed_origins,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          expose_headers=["Content-Disposition"])  # za slanje fajlova ili tokena)

    socketio.init_app(
                        app,
                        cors_allowed_origins="*",
                        ping_interval=10,
                        ping_timeout=25,
                        async_mode='eventlet',  # najstabilniji za Flask
                        reconnect=True,
                        always_connect=True,
                        engineio_logger=False
                        )  # stabilniji za produkciju (ako ga koristiš)
    from routes import register_blueprints
    # After request za dodatne CORS header-e (za OPTIONS/preflight)
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin')
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        return response

    app.config['MAX_CONTENT_LENGTH'] = 20 * 1024 * 1024  # 20MB
    # Ovo je za chatGBT
    app.config['OPENAI_API_KEY'] = os.environ.get('OPENAI_API_KEY')
    app.config['COHERE_API_KEY'] = os.environ.get('COHERE_API_KEY')
    # JWT konfiguracija
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
            return error
        app.logger.error(f"Neočekivana greška: {error}", exc_info=True)
        return jsonify({'error': 'Došlo je do greške na serveru.'}), 500

    # JWT konfiguracija
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
    #registracio eventa za chatGBt_routes
    registar_eventa_za_chatGBT(socketio)
    # Migracije
    import modeli
    with app.app_context():
        
        upgrade()
#
    return app
