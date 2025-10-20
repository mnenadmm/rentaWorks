# chatGbt_routes.py
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from flask_socketio import join_room
from extensions import socketio, db
from flask_socketio import join_room, emit  # Importuj emit
from datetime import datetime
from modeli import ChatTokenAl, ChatMessage
from flask_jwt_extended import decode_token

import cohere
import time
chat_gbt_bp = Blueprint('chatGbt', __name__, url_prefix='/chatgpt')



#Vraca istoriju dopisivanja sa chatgbt
@chat_gbt_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    try:
        # Povlačenje poruka iz baze za korisnika
        poruke = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at.asc()).all()
        
        # Pretvaranje u listu dict-ova za JSON
        history = [
            {
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            } for msg in poruke
        ]
        return jsonify({"history": history})

    except Exception as e:
        logging.error(f"Greška pri učitavanju istorije poruka: {e}")
        return jsonify({"error": "Došlo je do greške pri učitavanju istorije."}), 500
"""
    Ne moze se socket slati preko blueprinta, iz zbog toga moramo sve socket evente da saljemo
    kroz funkciju
    Uvezli smo u aplication setup
"""
def registar_eventa_za_chatGBT(socketio):
    # Funkcija samo za signalizaciju tipkanja bota 
    def status_tipkanja_bota(room, status):
        socketio.emit("typing_chatgbt", {"userId": 0, "status": status}, room=room)
    @socketio.on("novo")
    def novo(data):
        print("Primljeni podaci sa socketa:", data)  # <<< OVDE
        socketio.emit("chat_gpt_response",data)
    @socketio.on("send_message")
    def send_message(data):
        logging.info(f"STIGAO EVENT: {data}")
        print("Primljeni podaci sa socketa:", data)  # <<< OVDE
        if not data:
            print("Data je prazno!")  # Ovo je samo za test
        try:
            token = data.get("token")
            message = data.get("message")
            if not token or not message:
                socketio.emit("chat_gpt_response", {"error": "Niste poslali poruku"})
                return
            decoded = decode_token(token)
            user_id = decoded.get("sub")
            if not user_id:
                socketio.emit("chat_gpt_response", {"error": "Neispravan token"})
                return
            room_name = str(user_id)
            join_room(room_name)
            # Sačuvaj korisničku poruku
            user_chat = ChatMessage(
                user_id=user_id,
                role="user",
                content=message,
                chat_type="chatgpt",
                created_at=datetime.utcnow()
            )
            db.session.add(user_chat)
            db.session.commit()
    
            # Poziv Cohere
            client = cohere.Client(current_app.config.get("COHERE_API_KEY"))
            system_prompt = (
                "Ti si pomoćnik za korisnički chat. "
                "Razumeš srpski jezik i uvek odgovaraš na srpskom jeziku."
            )
            full_message = f"{system_prompt}\nKorisnik: {message}"
            response = client.chat(model="command-r-plus-08-2024", message=full_message)
            chat_gpt_response = response.text
    
            # SIGNAL: bot počinje tipkanje
            status_tipkanja_bota(room_name, "typing")
            socketio.sleep(1.0)  # pauza za vizuelni efekat tipkanja
    
            # POSALJI CELU PORUKU
            socketio.emit(
                "chat_gpt_response",
                {
                    "userId": 0,
                    "tekst": chat_gpt_response,
                    "status": "complete"
                },
                room=room_name
            )
    
            # SIGNAL: bot završio tipkanje
            status_tipkanja_bota(room_name, "stopped")
    
            # Sačuvaj odgovor asistenta
            assistant_chat = ChatMessage(
                user_id=user_id,
                role="assistant",
                content=chat_gpt_response,
                chat_type="chatgpt",
                created_at=datetime.utcnow()
            )
            db.session.add(assistant_chat)
            db.session.commit()
    
        except Exception as e:
            logging.error(f"Greška pri socket slanju poruke: {e}")
            socketio.emit("chat_gpt_response", {"error": "Došlo je do greške pri slanju poruke"})

       






####-----------------------------------------------------------------------------------#



