from flask import Blueprint, request, jsonify
from datetime import datetime
from modeli import Korisnik, TipKorisnikaEnum, Zanimanje, Vestina  # Dodao Zanimanje i Vestina modele
from werkzeug.security import generate_password_hash
from applicationSetup import db
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

#
# Ruta za login
#

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Usernamei lozinka su obavezni.'}), 400

    username= data['username']
    password = data['password']
    return jsonify({'message': f'Uspesno ste se ulogovali ${username}'}), 200





#
# Ruta za registraciju novih korisnika
#
@auth_bp.route('/registracija', methods=['POST'])
def registracija():
    data = request.json
    logger.info(f"Primljeni payload: {data}")

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

    novi_korisnik = Korisnik(**korisnik_data)

    # dodaje korisnika u sesiji     
    db.session.add(novi_korisnik)

    # Dodaje zanimanje i vestine 
    if 'zanimanje' in data:
        zanimanje_id = data['zanimanje']
        zanimanje = Zanimanje.query.get(zanimanje_id)
        if zanimanje:
            novi_korisnik.zanimanja = [zanimanje]

    if 'vestine' in data:
        novi_korisnik.vestine = []
        for vestina_id in data['vestine']:
            vestina = Vestina.query.get(vestina_id)
            if vestina:
                novi_korisnik.vestine.append(vestina)

    try:
        db.session.commit()
        return jsonify({'message': 'Korisnik uspešno registrovan'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Greška prilikom čuvanja u bazu', 'details': str(e)}), 500
