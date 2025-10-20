# komentari_routes.py
from flask import Blueprint, request, jsonify
from extensions import db
from modeli import Komentar, Interakcija
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

komentari_bp = Blueprint('komentari', __name__, url_prefix='/komentari')
#-------Komentari-----------
@komentari_bp.route('/firma/<int:firma_id>', methods=['GET'])
def komentari_firme(firma_id):
    komentari = Komentar.query.filter_by(firma_id=firma_id).order_by(Komentar.created_at.desc()).all()
    result = []
    for k in komentari:
        result.append({
            "id": k.id,
            "tekst": k.tekst,
            "korisnik_id": k.korisnik_id,
            "korisnik_ime": k.korisnik.username,
            "profilna_slika": k.korisnik.profilna_slika,
            "created_at": k.created_at.isoformat()
        })
    return jsonify(result)

@komentari_bp.route('/dodaj', methods=['POST'])
@jwt_required()
def dodaj_komentar():
    user_id = get_jwt_identity()
    data = request.get_json()
    firma_id = data.get('firma_id')
    tekst = data.get('tekst')

    if not firma_id or not tekst:
        return jsonify({"error": "Nedostaju podaci"}), 400

    # Kreiranje komentara
    komentar = Komentar(
        korisnik_id=user_id,
        firma_id=firma_id,
        tekst=tekst,
        created_at=datetime.utcnow()
    )
    db.session.add(komentar)

    # Update interakcije (otključavanje ocenjivanja) samo ako treba
    interakcija = Interakcija.query.filter_by(
        korisnik_id=user_id,
        firma_id=firma_id
    ).first()

    if not interakcija:
        interakcija = Interakcija(
            korisnik_id=user_id,
            firma_id=firma_id,
            komentar=True
        )
        db.session.add(interakcija)
    elif not interakcija.komentar:
        interakcija.komentar = True

    db.session.commit()

    # Vraćamo kompletan komentar
    return jsonify({
        "id": komentar.id,
        "tekst": komentar.tekst,
        "korisnik_id": komentar.korisnik_id,
        "korisnik_ime": komentar.korisnik.username,
        "profilna_slika": komentar.korisnik.profilna_slika,
        "created_at": komentar.created_at.isoformat()
    })
