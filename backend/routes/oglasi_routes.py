from flask import Blueprint, request, jsonify
from modeli import db, Oglas, Firma, Zanimanje
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import socketio
from flask_cors import cross_origin

oglasi_bp = Blueprint('oglasi', __name__)

# ================= SVI OGLASI =================
@oglasi_bp.route('/', methods=['GET'])
def svi_oglasi():
    query = Oglas.query

    lokacija = request.args.get('lokacija')
    if lokacija:
        query = query.filter(Oglas.lokacija.ilike(f"%{lokacija}%"))

    zanimanje_id = request.args.get('zanimanje_id')
    if zanimanje_id:
        try:
            zanimanje_id = int(zanimanje_id)
            query = query.join(Oglas.zanimanja).filter(Zanimanje.id == zanimanje_id)
        except ValueError:
            return jsonify({'error': 'zanimanje_id mora biti broj.'}), 400

    oglasi = query.order_by(Oglas.datum_objave.desc()).all()
    return jsonify([oglas.to_dict() for oglas in oglasi]), 200

# ================= DODAVANJE OGLASA =================
@oglasi_bp.route('/', methods=['POST'])
@jwt_required()
def dodaj_oglas():
    try:
        korisnik_id = get_jwt_identity()
        firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()
        if not firma:
            return jsonify({'error': 'Firma nije pronađena za korisnika.'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Nisu poslati podaci.'}), 400

        datum_objave_raw = data.get('datum_objave')
        datum_objave = None
        if datum_objave_raw:
            try:
                datum_objave = datetime.strptime(datum_objave_raw, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({'error': 'Datum objave nije u ispravnom formatu (YYYY-MM-DD).'}), 400

        novi_oglas = Oglas(
            opis=data['opis'],
            lokacija=data.get('lokacija'),
            datum_objave=datum_objave,
            firma_id=firma.id
        )

        zanimanje_ids = data.get('zanimanje_ids', [])
        if zanimanje_ids:
            zanimanja = Zanimanje.query.filter(Zanimanje.id.in_(zanimanje_ids)).all()
            novi_oglas.zanimanja = zanimanja

        db.session.add(novi_oglas)
        db.session.commit()

        # Emituje novi oglas svim klijentima
        socketio.emit("novi_oglas", novi_oglas.to_dict())
        return jsonify({'message': 'Oglas uspešno dodat.'}), 201

    except KeyError as e:
        return jsonify({'error': f'Nedostaje polje: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Greška pri dodavanju oglasa.', 'details': str(e)}), 500

# ================= MOJI OGLASI =================
@oglasi_bp.route('/moji-oglasi', methods=['GET'])
@jwt_required()
def moji_oglasi():
    try:
        korisnik_id = get_jwt_identity()
        firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()
        if not firma:
            return jsonify({'error': 'Korisnik nema registrovanu firmu.'}), 404

        oglasi = Oglas.query.filter_by(firma_id=firma.id).all()
        return jsonify([oglas.to_dict() for oglas in oglasi]), 200
    except Exception as e:
        return jsonify({'error': 'Došlo je do greške pri učitavanju oglasa.', 'details': str(e)}), 500

# ================= BRISANJE OGLASA =================
@oglasi_bp.route('/<int:oglas_id>', methods=['DELETE'])
@jwt_required()
def obrisi_oglas(oglas_id):
    try:
        korisnik_id = get_jwt_identity()
        firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()
        if not firma:
            return jsonify({'error': 'Korisnik nema registrovanu firmu.'}), 404

        oglas = Oglas.query.filter_by(id=oglas_id, firma_id=firma.id).first()
        if not oglas:
            return jsonify({'error': 'Oglas nije pronađen ili ne pripada vašoj firmi.'}), 404

        db.session.delete(oglas)
        db.session.commit()

        socketio.emit("oglas_obrisan", {'id': oglas_id})
        return jsonify({'message': 'Oglas je uspešno obrisan.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Došlo je do greške pri brisanju oglasa.', 'details': str(e)}), 500

# ================= AŽURIRANJE OGLASA =================
@oglasi_bp.route('/<int:oglas_id>', methods=['PUT'])
@jwt_required()
def azuriraj_oglas(oglas_id):
    try:
        korisnik_id = get_jwt_identity()
        firma = Firma.query.filter_by(vlasnik_id=korisnik_id).first()
        if not firma:
            return jsonify({'error': 'Korisnik nema registrovanu firmu.'}), 404

        oglas = Oglas.query.filter_by(id=oglas_id, firma_id=firma.id).first()
        if not oglas:
            return jsonify({'error': 'Oglas nije pronađen ili ne pripada vašoj firmi.'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Nisu poslati podaci.'}), 400

        datum_objave_raw = data.get('datum_objave')
        if datum_objave_raw:
            try:
                oglas.datum_objave = datetime.strptime(datum_objave_raw, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({'error': 'Datum objave nije u ispravnom formatu (YYYY-MM-DD).'}), 400

        oglas.opis = data.get('opis', oglas.opis)
        oglas.lokacija = data.get('lokacija', oglas.lokacija)

        zanimanje_ids = data.get('zanimanje_ids')
        if zanimanje_ids is not None:
            zanimanja = Zanimanje.query.filter(Zanimanje.id.in_(zanimanje_ids)).all()
            oglas.zanimanja = zanimanja

        db.session.commit()

        socketio.emit("oglas_azuriran", oglas.to_dict())    
        return jsonify({'message': 'Oglas uspešno ažuriran.'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Došlo je do greške pri ažuriranju oglasa.', 'details': str(e)}), 500

# ================= ZANIMANJA =================
@oglasi_bp.route('/zanimanja', methods=['GET'])
@jwt_required()
@cross_origin()
def get_zanimanja():
    svi = Zanimanje.query.all()
    result = [{"id": z.id, "naziv": z.naziv} for z in svi]
    return jsonify(result), 200
