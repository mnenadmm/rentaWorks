from flask import Blueprint, request, jsonify
from datetime import datetime
from modeli import Korisnik
from werkzeug.security import generate_password_hash
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/registracija', methods=['POST'])
def registracija():
    data = request.json
    # Hesovanje lozinke
    data['lozinka'] = generate_password_hash(data.pop('password'))
    # Rebacuje datum iz stringa u objekat
    if 'datumRodjenja' in data:
        try:
            data['datumRodjenja'] = datetime.strptime(data['datumRodjenja'],'%Y-%m-%d').date()
        except ValueError :
            return jsonify({'error' : 'Neospravan format datuma'}),400
    #Preuzimamo nazive kolona iz modela
    dozvoljena_polja =  Korisnik.__table__.columns.keys()
    #Filtrita podatke za prolsedjivanje modelu
    korisnik_data = { k: v for k, v in data.items() if k in dozvoljena_polja}
    #kreira novog korsinika
    novi_korisnik = Korisnik(**korisnik_data)

    return jsonify(novi_korisnik)