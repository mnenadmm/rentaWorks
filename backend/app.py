from applicationSetup import create_app,db
from flask import jsonify, request
from sqlalchemy import text  # type: ignore
from extensions import db
import logging
app = create_app()
from flask_jwt_extended import  jwt_required # type: ignore


@app.route('/proba')
#@jwt_required()
def proba():
    return jsonify('Uspesnooooooooo i sada je')
@app.route('/konekcija')
def db_check():
    try:
        # Izvršavanje jednostavnog upita preko SQLAlchemya
        result = db.session.execute(text('SELECT 1')).scalar()
        if result == 1:
            return jsonify({"message": "Konekcija na bazu je uspešna"}), 200
        else:
            return jsonify({"message": "Upit je prošao, ali rezultat nije očekivan"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, use_reloader=True)
