from flask import Blueprint, request, jsonify
from datetime import datetime
from modeli import Korisnik, TipKorisnika,TipKorisnikaEnum
from werkzeug.security import generate_password_hash
from applicationSetup import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/registracija', methods=['POST'])
def registracija():
    data = request.json
    
    # Provera obaveznih polja
    obavezna_polja = ['username', 'password', 'ime', 'prezime', 'email', 'tip_korisnika']

    for polje in obavezna_polja:
        if polje not in data or not data[polje]:
            return jsonify({'error': f'Polje "{polje}" je obavezno.'}), 400
    
    # Validacija enum tip_korisnika
    try:
        data['tip_korisnika'] = TipKorisnika(data['tip_korisnika'])
    except ValueError:
        return jsonify({'error': 'Neispravan tip korisnika.'}), 400
    
    # Hesovanje lozinke i preimenovanje ključa
    data['lozinka'] = generate_password_hash(data.pop('password'))

    # Validacija datuma rodjenja, ako postoji
    if 'datumRodjenja' in data:
        try:
            data['datumRodjenja'] = datetime.strptime(data['datumRodjenja'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Neispravan format datuma, očekuje se YYYY-MM-DD'}), 400
    
    # Filtriranje dozvoljenih polja iz modela
    dozvoljena_polja = Korisnik.__table__.columns.keys()
    korisnik_data = {k: v for k, v in data.items() if k in dozvoljena_polja}
    
    # Pretvori enum u string radi JSON odgovoraa
    if 'tip_korisnika' in korisnik_data:
        korisnik_data['tip_korisnika'] = korisnik_data['tip_korisnika'].value

    novi_korisnik = Korisnik(**korisnik_data)
    print("Podaci za novog korisnika:", korisnik_data)
    return jsonify({'message': 'Korisnik uspešno registrovan'}), 200
     
    #try:
    #     db.session.add(novi_korisnik)
    #     db.session.commit()
    #     return jsonify({'message': 'Korisnik uspešno registrovan'}), 200
    #except Exception as e:
    #     db.session.rollback()
    #     import traceback
    #     traceback.print_exc()
    #     return jsonify({'error': 'Došlo je do greške prilikom konekcije ka bazi', 'details': str(e)}), 500


