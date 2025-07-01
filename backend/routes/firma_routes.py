from flask import Blueprint, jsonify, request, current_app, send_from_directory
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from modeli import Firma
import os
import re
import logging

firma_bp = Blueprint('firma', __name__)

def sanitize_filename(name):
    name = name.strip().lower()
    name = re.sub(r'\s+', '_', name)
    name = re.sub(r'[^a-z0-9_]', '', name)
    return name

@firma_bp.route('/moja-firma', methods=['GET'])
@jwt_required()
def moja_firma():
    print("Ruta /moja-firma je pozvana!") 
    korisnik_id = get_jwt_identity()
    firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()
    if not firma:
        return jsonify({'error': 'Korisnik nema kreiranu firmu.'}), 404
    return jsonify({'firma': firma.to_dict()}), 200

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
