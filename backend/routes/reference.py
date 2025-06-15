#Koristimo za reference korisnika
from flask import Blueprint, jsonify
from extensions import db
from modeli import Zanimanje, Vestina

reference_bp = Blueprint('reference', __name__)

@reference_bp.route('/zanimanja', methods=['GET'])
def get_zanimanja():
    zanimanja = Zanimanje.query.all()
    result = [{"id": z.id, "naziv": z.naziv} for z in zanimanja]
    return jsonify(result)

@reference_bp.route('/vestine', methods=['GET'])
def get_vestine():
    vestine = Vestina.query.all()
    result = [{"id": v.id, "naziv": v.naziv} for v in vestine]
    return jsonify(result)

@reference_bp.route('/drzave', methods=['GET'])
def get_drzave():
    drzave = [
        { "code": "RS", "name": "Srbija" },
        { "code": "HR", "name": "Hrvatska" },
        { "code": "BA", "name": "Bosna i Hercegovina" },
        { "code": "MK", "name": "Severna Makedonija" },
        { "code": "SI", "name": "Slovenija" },
        { "code": "ME", "name": "Crna Gora" },
        { "code": "AL", "name": "Albanija" }
    ]
    return jsonify(drzave)


