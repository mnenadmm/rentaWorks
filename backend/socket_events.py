from extensions import socketio
from flask_socketio import emit
# ==================== CONNECT / DISCONNECT ====================
# Poziva se kada se klijent poveže na socket
@socketio.on('connect')
def handle_connect():
    print('🟢 Klijent povezan')
# Poziva se kada se klijent diskonektuje sa socket-a
@socketio.on('disconnect')
def handle_disconnect():
    print('🔴 Klijent diskonektovan')

#
#@socketio.on("send_message")
#def send_message(data):
#    print("Primljeni podaci sa socketa ovo je events.py:", data)
