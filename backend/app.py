from applicationSetup import create_app,db
from flask import jsonify
from sqlalchemy import text  # type: ignore
from extensions import db
app = create_app()

@app.route('/konekcija')
def db_check():
    try:
        # Izvršavanje jednostavnog upita preko SQLAlchemy
        result = db.session.execute(text('SELECT 1')).scalar()
        if result == 1:
            return jsonify({"message": "Konekcija na bazu je uspešna"}), 200
        else:
            return jsonify({"message": "Upit je prošao, ali rezultat nije očekivan"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/')
def home():
    return {"message": "Nenad 1234S sada radi "}
if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, use_reloader=True)
