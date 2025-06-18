from flask import Blueprint, request, jsonify
from datetime import datetime
from modeli import Korisnik, TipKorisnikaEnum, Zanimanje, Vestina  # Dodao Zanimanje i Vestina modele
from werkzeug.security import generate_password_hash
from applicationSetup import db
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/registracija', methods=['POST'])
def registracija():
    data = request.json
    logger.info(f"Primljeni payload: {data}")
    # Obavezna polja za registraciju
    obavezna_polja = ['username', 'password', 'ime', 'prezime', 'email', 'tip_korisnika']

    for polje in obavezna_polja:
        if polje not in data or not data[polje]:
            return jsonify({'error': f'Polje "{polje}" je obavezno.'}), 400
    
    # Validacija tip_korisnika (enum)
    try:
        data['tip_korisnika'] = TipKorisnikaEnum(data['tip_korisnika'])
    except ValueError:
        return jsonify({'error': 'Neispravan tip korisnika.'}), 400
    
    # Hash lozinke i uklanjanje originalnog password polja
    data['lozinka'] = generate_password_hash(data.pop('password'))

    # Parsiranje datuma rođenja ako je prosleđen
    if 'datum_rodjenja' in data:
        try:
            data['datum_rodjenja'] = datetime.strptime(data['datum_rodjenja'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Neispravan format datuma, očekuje se YYYY-MM-DD'}), 400
    
    # Uzmi samo polja koja postoje u modelu Korisnik
    dozvoljena_polja = Korisnik.__table__.columns.keys()
    korisnik_data = {k: v for k, v in data.items() if k in dozvoljena_polja}

    # Kreiraj korisnika sa osnovnim podacima
    novi_korisnik = Korisnik(**korisnik_data)

    # Dodatno: dodela zanimanja ako su poslata (lista ID-jeva)
    # Ako je 'zanimanje' jedan ID
    if 'zanimanje' in data:
        zanimanje_id = data['zanimanje']
        zanimanje = Zanimanje.query.get(zanimanje_id)
        if zanimanje:
            # Postavi listu sa jednim zanimanjem
            novi_korisnik.zanimanja = [zanimanje]

    # Ako je 'vestine' lista ID-jeva
    if 'vestine' in data:
        novi_korisnik.vestine = []  # obriši postojeće veštine ako ih ima
        for vestina_id in data['vestine']:
            vestina = Vestina.query.get(vestina_id)
            if vestina:
                novi_korisnik.vestine.append(vestina)
 

    try:
        db.session.add(novi_korisnik)
        db.session.commit()
        return jsonify({'message': 'Korisnik uspešno registrovan'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Greška prilikom čuvanja u bazu', 'details': str(e)}), 500
