from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy # type: ignore
from extensions import db, migrate
from flask_migrate import Migrate, upgrade # type: ignore
from konekcija import get_database_uri
from routes import register_blueprints
from flask_jwt_extended import JWTManager # type: ignore
from datetime import timedelta
migrate = Migrate()
def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    jwt = JWTManager(app)
    app.config['JWT_SECRET_KEY'] = 'moj_tajni_kljuc'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
    #korisnik ce nakon 7 dana morati opet da se uloguje
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
    #CORS(app, resources={r"/*": {"origins": "http://5.75.164.111:4200"}}, supports_credentials=True)
    # Učitaj DATABASE_URL iz .env
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate.init_app(app, db)
    register_blueprints(app)
    
    
    import modeli
    with app.app_context():
        upgrade()  # Primeni migracije (safe)
        

    return app
