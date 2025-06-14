from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/registracija', methods=['POST'])
def registracija():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # logika registracije...
    print('Registrovani podaci:', data)
    return jsonify(data)