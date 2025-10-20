from flask import Blueprint, jsonify, request, current_app, send_from_directory
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from modeli import Firma
import os
import re
import logging
import uuid
firma_bp = Blueprint('firma', __name__)

def sanitize_filename(name):
    name = name.strip().lower()
    name = re.sub(r'\s+', '_', name)
    name = re.sub(r'[^a-z0-9_]', '', name)
    return name

@firma_bp.route('/moja-firma', methods=['GET'])
@jwt_required()
def moja_firma():
    
    korisnik_id = get_jwt_identity()
    firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()
    if not firma:
        return jsonify({'error': 'Korisnik nema kreiranu firmu.'}), 404
    return jsonify({'firma': firma.to_dict()}), 200

@firma_bp.route('/firme', methods=['GET'])
def sve_firme():
    try:
        firme = Firma.query.all()
        firme_lista = [firma.to_dict() for firma in firme]
        return jsonify(firme_lista), 200
    except Exception as e:
        return jsonify({'error': 'Greška pri učitavanju firmi.', 'details': str(e)}), 500
        
@firma_bp.route('/firme', methods=['POST'])
@jwt_required()
def kreiraj_firmu():
    data = request.get_json()
    required_fields = ['naziv', 'pib']
    missing = [f for f in required_fields if f not in data or not data[f]]
    if missing:
        return jsonify({'success': False, 'error': f'Nedostaju sledeća obavezna polja: {", ".join(missing)}'}), 400

    if not data['pib'].isdigit() or len(data['pib']) < 8:
        return jsonify({'success': False, 'error': 'PIB mora biti broj i najmanje 8 cifara.'}), 400

    vlasnik_id = get_jwt_identity()

    nova_firma = Firma(
        naziv=data['naziv'],
        pib=data['pib'],
        adresa=data.get('adresa'),
        telefon=data.get('telefon'),
        email=data.get('email'),
        web_sajt=data.get('web_sajt'),
        opis=data.get('opis'),
        godina_osnivanja=data.get('godina_osnivanja'),
        vlasnik_id=vlasnik_id
    )
    try:
        db.session.add(nova_firma)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logging.error(f'Greška pri čuvanju firme: {e}')
        return jsonify({'success': False, 'error': 'Greška pri čuvanju firme u bazi.'}), 500

    return jsonify({'success': True, 'message': 'Firma je uspešno kreirana.', 'data': nova_firma.to_dict()}), 201

@firma_bp.route('/firme/<int:firma_id>/logo', methods=['POST'])
@jwt_required()
def upload_logo(firma_id):
    if 'logo' not in request.files:
        return jsonify({'success': False, 'error': 'Logo nije poslat'}), 400

    logo = request.files['logo']
    allowed_ext = {'jpg', 'jpeg', 'png', 'gif'}
    filename = logo.filename.lower()

    if '.' not in filename:
        return jsonify({'success': False, 'error': 'Fajl nema ekstenziju'}), 400

    ext = filename.rsplit('.', 1)[1]
    if ext not in allowed_ext:
        return jsonify({'success': False, 'error': 'Neispravan format fajla'}), 400

    firma = Firma.query.get(firma_id)
    if not firma:
        return jsonify({'success': False, 'error': 'Firma ne postoji'}), 404

    korisnik_id = get_jwt_identity()
    if firma.vlasnik_id != int(korisnik_id):
        return jsonify({'success': False, 'error': 'Nemate pravo da menjate logo ove firme'}), 403

    sanitized_name = sanitize_filename(firma.naziv)
    save_filename = f"{sanitized_name}.{ext}"

    folder_path = os.path.join(current_app.root_path, 'static', 'uploads', 'logos')
    os.makedirs(folder_path, exist_ok=True)
    save_path = os.path.join(folder_path, save_filename)
    
    if firma.logo:
        old_file = os.path.join(folder_path, firma.logo)
        if os.path.exists(old_file) and firma.logo != save_filename:
            try:
                os.remove(old_file)
            except Exception as e:
                return jsonify({'success': False, 'error': 'Greška pri brisanju stare slike', 'details': str(e)}), 500

    try:
        logo.save(save_path)
    except Exception as e:
        return jsonify({'success': False, 'error': 'Greška pri čuvanju fajla', 'details': str(e)}), 500

    firma.logo = save_filename
    try:
        db.session.commit()
    except Exception as e:
        return jsonify({'success': False, 'error': 'Greška pri čuvanju u bazi', 'details': str(e)}), 500

    return jsonify({'success': True, 'message': 'Logo uspešno dodat', 'logo': save_filename}), 200

@firma_bp.route('/static/uploads/logos/<path:filename>', methods=['GET'])
def serve_logo(filename):
    folder_path = os.path.join(current_app.root_path, 'static', 'uploads', 'logos')
    return send_from_directory(folder_path, filename)
@firma_bp.route('/moja-firma', methods=['PUT'])
@jwt_required()
def update_moja_firma():
    korisnik_id = get_jwt_identity()
    firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()

    if not firma:
        return jsonify({'success': False, 'error': 'Firma nije pronađena.'}), 404

    # Podaci iz forme
    naziv = request.form.get('naziv')
    pib = request.form.get('pib')
    adresa = request.form.get('adresa')
    telefon = request.form.get('telefon')
    email = request.form.get('email')
    web_sajt = request.form.get('web_sajt')

    # Validacije
    if not naziv or not pib:
        return jsonify({'success': False, 'error': 'Polja naziv i PIB su obavezna.'}), 400
    if not pib.isdigit() or len(pib) < 8:
        return jsonify({'success': False, 'error': 'PIB mora biti broj i najmanje 8 cifara.'}), 400

    # Ažuriranje polja
    firma.naziv = naziv
    firma.pib = pib
    firma.adresa = adresa
    firma.telefon = telefon
    firma.email = email
    firma.web_sajt = web_sajt

    # ---------- Logika za ažuriranje logo fajla ----------
    if 'logo_fajl' in request.files:
        logo = request.files['logo_fajl']
        if logo.filename != '':
            allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic',
                                  'heif', 'bmp', 'tiff', 'svg', 'ico'}
            mimetype = logo.mimetype
            if not mimetype.startswith('image/'):
                return jsonify({'success': False, 'error': 'Fajl mora biti slika.'}), 400

            extension = logo.filename.rsplit('.', 1)[-1].lower()
            if extension not in allowed_extensions:
                return jsonify({'success': False, 'error': 'Nedozvoljena ekstenzija slike.'}), 400

            # Generiši jedinstveno ime fajla
            filename = f"{uuid.uuid4()}.{extension}"
            folder_path = os.path.join(current_app.root_path, 'static', 'uploads', 'logos')
            save_path = os.path.join(folder_path, filename)

            # Briši stari logo ako postoji i nije isti kao novi
            if firma.logo:
                old_file = os.path.join(folder_path, firma.logo)
                if os.path.exists(old_file) and firma.logo != filename:
                    try:
                        os.remove(old_file)
                    except Exception as e:
                        return jsonify({'success': False, 'error': 'Greška pri brisanju stare slike', 'details': str(e)}), 500

            # Sačuvaj novi logo
            logo.save(save_path)
            firma.logo = filename

    # ---------- Logika za ažuriranje ocene ----------
    nova_ocena = request.form.get('ocena')
    if nova_ocena:
        try:
            nova_ocena = int(nova_ocena)
            if not 1 <= nova_ocena <= 5:
                return jsonify({'success': False, 'error': 'Ocena mora biti između 1 i 5.'}), 400
        except Exception:
            return jsonify({'success': False, 'error': 'Ocena mora biti ceo broj.'}), 400

        # Inicijalizacija polja ako su None
        if firma.prosecna_ocena is None:
            firma.prosecna_ocena = 0
        if firma.broj_ocena is None:
            firma.broj_ocena = 0

        # Racunanje nove prosecne ocene
        firma.prosecna_ocena = (firma.prosecna_ocena * firma.broj_ocena + nova_ocena) / (firma.broj_ocena + 1)
        firma.broj_ocena += 1

    # ---------- Commit u bazu ----------
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Firma uspešno ažurirana.',
            'firma': firma.to_dict(),
            'prosecna_ocena': firma.prosecna_ocena,
            'broj_ocena': firma.broj_ocena
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Greška pri ažuriranju firme.', 'details': str(e)}), 500


@firma_bp.route('/firme/<int:firma_id>', methods=['GET'])
def get_firma_po_id(firma_id):
    """
    Vrati firmu po ID-ju
    """
    firma = Firma.query.get(firma_id)
    if not firma:
        return jsonify({'error': 'Firma nije pronađena.'}), 404

    return jsonify(firma.to_dict()), 200