from flask import Blueprint, request, jsonify
from extensions import db
from modeli import Firma, Korisnik, Interakcija  # u modelima mora da postoje polja prosecna_ocena i broj_ocena
from flask_jwt_extended import jwt_required, get_jwt_identity

# Blueprint za ocene
ocena_bp = Blueprint('ocena', __name__, url_prefix='/api')

@ocena_bp.route('/<tip>/<int:id>/ocena', methods=['POST'])
@jwt_required()  # samo ulogovani korisnici mogu da ocenjuju
def post_ocena(tip, id):
    """
    Endpoint za postavljanje ocene za firmu ili radnika.
    tip: 'firma' ili 'radnik'
    id: ID entiteta koji se ocenjuje
    telo zahteva: { "ocena": broj između 1 i 5 }
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    ocena_vrednost = data.get('ocena')

    # Provera validnosti ocene
    if not ocena_vrednost or not (1 <= ocena_vrednost <= 5):
        return jsonify({'error': 'Nevažeća ocena'}), 400

    # Dohvatanje entiteta iz baze
    if tip == 'firma':
        entitet = Firma.query.get(id)
        # Provera interakcije sa firmom
        interakcija = Interakcija.query.filter_by(
            korisnik_id=user_id,
            firma_id=id
        ).first()
        if not interakcija or not (interakcija.komentar or interakcija.poruka):
            return jsonify({'error': 'Morate prvo imati interakciju sa firmom da biste je ocenili'}), 403

    elif tip == 'radnik':
        entitet = Korisnik.query.get(id)
        # Provera interakcije sa radnikom (ako imate implementirano)
        interakcija = Interakcija.query.filter_by(
            korisnik_id=user_id,
            radnik_id=id  # ili prilagoditi za radnika ako imate posebnu logiku
        ).first()
        if not interakcija or not (interakcija.komentar or interakcija.poruka):
            return jsonify({'error': 'Morate prvo imati interakciju sa radnikom da biste ga ocenili'}), 403
    else:
        return jsonify({'error': 'Nepoznat tip entiteta'}), 400

    if not entitet:
        return jsonify({'error': f'{tip} sa datim ID ne postoji'}), 404

    # Inicijalizacija polja ako su None
    if not getattr(entitet, 'prosecna_ocena', None):
        entitet.prosecna_ocena = 0
    if not getattr(entitet, 'broj_ocena', None):
        entitet.broj_ocena = 0

    # Računanje nove prosečne ocene (inkrementalno)
    ukupno_ocena = entitet.prosecna_ocena * entitet.broj_ocena
    entitet.broj_ocena += 1
    entitet.prosecna_ocena = round((ukupno_ocena + ocena_vrednost) / entitet.broj_ocena, 2)
    # Označi da je korisnik ocenio
    if interakcija:
        interakcija.ocena = True
    # Snimanje u bazu
    db.session.commit()

    # Vraćanje nove prosečne ocene i broja ocena frontend-u
    return jsonify({
        'prosecna_ocena': entitet.prosecna_ocena,
        'broj_ocena': entitet.broj_ocena
    }), 200
@ocena_bp.route('/firma/<int:firma_id>/moze-da-oceni', methods=['GET'])
@jwt_required()  # ovo je važno
def moze_da_oceni_firmu(firma_id):
    user_id = get_jwt_identity()

    # Pronađi interakciju korisnika sa firmom
    interakcija = Interakcija.query.filter_by(
        korisnik_id=user_id,
        firma_id=firma_id
    ).first()

    # Ako ne postoji interakcija → korisnik ne može da oceni
    if not interakcija:
        return jsonify({
            "moze": False,
            "poruka": "Morate prvo imati interakciju sa firmom da biste mogli da ocenite."
        })
    # Ako je već ocenio → ne može ponovo
    if interakcija.ocena:
        return jsonify({
            "moze": False,
            "poruka": "Već ste ocenili ovu firmu."
        })
    

    # Ako interakcija postoji, ali još nije ocenio → može
    return jsonify({
        "moze": True
    })
