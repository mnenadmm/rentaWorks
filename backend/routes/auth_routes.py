from flask import Blueprint, request, jsonify,send_from_directory, current_app
from datetime import datetime
from modeli import Korisnik, TipKorisnikaEnum, Zanimanje, Vestina  
from werkzeug.security import generate_password_hash,check_password_hash
from flask_jwt_extended import create_access_token,create_refresh_token, jwt_required, get_jwt_identity # type: ignore
from applicationSetup import db
from datetime import timedelta
import logging
import os
import uuid
from flask import make_response
logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/current-user', methods=['GET'])
@jwt_required()
def current_user():
    korisnik_id = get_jwt_identity()
    korisnik = Korisnik.query.get(korisnik_id)
    if not korisnik:
        return jsonify({'error': 'Korisnik nije pronađen'}), 404

    # Pretpostavljam da nemaš to_dict() metodu, pa ti je evo primer:
    user_data = {
        'id': korisnik.id,
        'username': korisnik.username,
        'ime': korisnik.ime,
        'prezime': korisnik.prezime,
        'email': korisnik.email,
        'ima_firmu': len(korisnik.firme) > 0,  # True ako ima firmu, False ako nema
        'tip_korisnika': korisnik.tip_korisnika.value if korisnik.tip_korisnika else None,
        'profilna_slika': korisnik.profilna_slika if hasattr(korisnik, 'profilna_slika') else None
        # Dodaj ovde još polja koja ti trebaju u frontend-u
    }

    return jsonify(user_data), 200

#
# Ruta za login
#

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    logger.info(f"Primljeni payload: {data}")

    if not data or 'username' not in data or 'lozinka' not in data:
        return jsonify({'error': 'Username i lozinka su obavezni.'}), 400

    username = data['username']
    lozinka = data['lozinka']
    korisnik = Korisnik.query.filter_by(username=username).first()

    if not korisnik or not check_password_hash(korisnik.lozinka, lozinka):
        return jsonify({'error': 'Neispravno korisnicko ime ili lozinka.'}), 401

    access_token = create_access_token(identity=str(korisnik.id), expires_delta=timedelta(hours=15))
    refresh_token = create_refresh_token(identity=str(korisnik.id))

    user_data = {
        'id': korisnik.id,
        'username': korisnik.username,
        'ime': korisnik.ime,
        'prezime': korisnik.prezime,
        'email': korisnik.email,
        'tip_korisnika': korisnik.tip_korisnika.value if korisnik.tip_korisnika else None,
        'ima_firmu': len(korisnik.firme) > 0,  # True ako ima firmu, False ako nema
        'profilna_slika': korisnik.profilna_slika if hasattr(korisnik, 'profilna_slika') else None
    }

    response = make_response(jsonify({
        'message': f'Uspesno ste se ulogovali kao {korisnik.username}',
        'token': access_token,
        'user': user_data
    }))

    response.set_cookie(
        'refresh_token',
        refresh_token,
        httponly=True,
        samesite='Lax',
        secure=False
    )
    return response

   
#
#Ova ruta se koristi za rifres tokena 
#
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id, expires_delta=timedelta(minutes=15))

    return jsonify({'access_token': new_access_token}), 200


@auth_bp.route('/static/uploads/<filename>')
@jwt_required()
def serve_upload(filename):
    uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    return send_from_directory(uploads_dir, filename)

@auth_bp.route('/upload_profile_image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'Nije prosleđen fajl'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Nema izabranog fajla'}), 400

    # Ekstenzija
    if '.' in file.filename:
        ext = file.filename.rsplit('.', 1)[1].lower()
    else:
        return jsonify({'success': False, 'error': 'Fajl nema ekstenziju'}), 400

    # Dozvoljene ekstenzije i MIME tipovi
    dozvoljene_ekstenzije = {
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic',
        'heif', 'bmp', 'tiff', 'svg', 'ico'
    }

    dozvoljeni_mime = {
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic',
        'image/heif', 'image/bmp', 'image/tiff', 'image/svg+xml',
        'image/x-icon', 'image/vnd.microsoft.icon', 'image/x-png', 'image/x-bmp'
    }

    if ext not in dozvoljene_ekstenzije or file.mimetype not in dozvoljeni_mime:
        return jsonify({'success': False, 'error': 'Nepodržani format fajla'}), 400

    # Dodatna sigurnosna provera
    if not file.mimetype.startswith('image/'):
        return jsonify({'success': False, 'error': 'Fajl nije slika'}), 400

    # Kreiranje direktorijuma i čuvanje slike
    filename = f"{uuid.uuid4().hex}.{ext}"
    uploads_dir = os.path.join(current_app.root_path, 'static', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    filepath = os.path.join(uploads_dir, filename)

    try:
        file.save(filepath)
    except Exception as e:
        return jsonify({'success': False, 'error': 'Greška pri čuvanju fajla', 'details': str(e)}), 500

    korisnik_id = get_jwt_identity()
    korisnik = Korisnik.query.get(korisnik_id)
    if not korisnik:
        return jsonify({'success': False, 'error': 'Korisnik nije pronađen'}), 404

    # Brisanje stare slike
    if korisnik.profilna_slika:
        stari_fajl = os.path.join(uploads_dir, korisnik.profilna_slika)
        if os.path.exists(stari_fajl):
            try:
                os.remove(stari_fajl)
            except Exception as e:
                return jsonify({'success': False, 'error': 'Greška pri brisanju stare slike', 'details': str(e)}), 500

    korisnik.profilna_slika = filename

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({'success': False, 'error': 'Greška pri čuvanju u bazu', 'details': str(e)}), 500

    return jsonify({'success': True, 'message': 'Slika uspešno uploadovana', 'filename': filename}), 200





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
