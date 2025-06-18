from flask import Blueprint, request, jsonify
from datetime import datetime
from modeli import Korisnik, TipKorisnikaEnum

from werkzeug.security import generate_password_hash
from applicationSetup import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/registracija', methods=['POST'])
def registracija():
    data = request.json

    obavezna_polja = ['username', 'password', 'ime', 'prezime', 'email', 'tip_korisnika']

    for polje in obavezna_polja:
        if polje not in data or not data[polje]:
            return jsonify({'error': f'Polje "{polje}" je obavezno.'}), 400
    
    try:
        data['tip_korisnika'] = TipKorisnikaEnum(data['tip_korisnika'])
    except ValueError:
        return jsonify({'error': 'Neispravan tip korisnika.'}), 400
    
    data['lozinka'] = generate_password_hash(data.pop('password'))

    if 'datum_rodjenja' in data:
        try:
            data['datum_rodjenja'] = datetime.strptime(data['datum_rodjenja'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Neispravan format datuma, očekuje se YYYY-MM-DD'}), 400
    
    dozvoljena_polja = Korisnik.__table__.columns.keys()
    korisnik_data = {k: v for k, v in data.items() if k in dozvoljena_polja}
    
    # Enum u bazu može kao enum, ne moraš u string pre nego što ga proslediš modelu
    novi_korisnik = Korisnik(**korisnik_data)
    
    try:
        db.session.add(novi_korisnik)
        db.session.commit()
        return jsonify({'message': 'Korisnik uspešno registrovan'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Greška prilikom čuvanja u bazu', 'details': str(e)}), 500


