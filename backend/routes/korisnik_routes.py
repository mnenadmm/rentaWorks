#
#Koristimo za rute korsinika
#
from flask import Blueprint, jsonify, abort
from extensions import db
from modeli import Korisnik

korisnik_bp = Blueprint('korisnik', __name__)

@korisnik_bp.route('/api/korisnici/<int:id>', methods=['GET'])
def get_korisnik(id):
    korisnik = Korisnik.query.get(id)
    if korisnik is None:
        abort (404,  description="Korisnik nije pronađen")
    
    return jsonify(korisnik.to_dict())
