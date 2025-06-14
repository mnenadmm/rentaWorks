from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy # type: ignore
from extensions import db, migrate
from flask_migrate import Migrate, upgrade # type: ignore
from konekcija import get_database_uri



migrate = Migrate()
def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    # Učitaj DATABASE_URL iz .env
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate.init_app(app, db)
    import modeli
    with app.app_context():
        upgrade()  # Primeni migracije (safe)


    return app
