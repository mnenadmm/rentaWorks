from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
from flask_jwt_extended import decode_token, jwt_required, get_jwt_identity
from extensions import db, socketio
from modeli import ChatMessage
from flask_socketio import join_room, emit  # Importuj emit
chat_bp = Blueprint('chat', __name__, url_prefix='/chat')



# Emit status tipkanja
def user_typing_status(room, status, user_id):
    socketio.emit("typing", {"userId": user_id, "status": status}, room=room)

# Događaj kada korisnik kuca
@socketio.on("typing")
def handle_typing(data):
    try:
        token = data.get("token")
        to_user_id = data.get("to_user_id")
        status = data.get("status")  # "typing" ili "stopped"
        if not token or not to_user_id or not status:
            socketio.emit("message_response", {"error": "Nedostaju podaci"})
            return
        decoded = decode_token(token)
        from_user_id = decoded.get("sub")
        if not from_user_id:
            socketio.emit("message_response", {"error": "Neispravan token"})
            return
        # Soba samo za primaoca
        room_name = f"chat_{to_user_id}"
        user_typing_status(room_name, status, from_user_id)

    except Exception as e:
        logging.error(f"Greška pri tipkanju: {e}")
        socketio.emit("message_response", {"error": "Došlo je do greške"})

# Slanje poruke korisnik–korisnik
@socketio.on("send_message")
def handle_send_message(data):
    try:
        token = data.get("token")
        message = data.get("message")
        to_user_id = data.get("to_user_id")

        if not token or not message or not to_user_id:
            socketio.emit("message_response", {"error": "Nedostaju podaci"})
            return

        decoded = decode_token(token)
        from_user_id = decoded.get("sub")
        if not from_user_id:
            socketio.emit("message_response", {"error": "Neispravan token"})
            return
        # Soba samo za primaoca
        room_name = f"chat_{to_user_id}"

        # Sačuvaj poruku u bazi
        chat_msg = ChatMessage(
            user_id=from_user_id,
            id_primaoca=to_user_id,
            role="user",
            content=message,
            chat_type="regular",
            created_at=datetime.utcnow()
        )
        db.session.add(chat_msg)
        db.session.commit()

        # Emit samo primaocu
        socketio.emit(
            "new_message",
            {
                "id": chat_msg.id,
                "from_user": from_user_id,
                "to_user": to_user_id,
                "content": message,
                "created_at": chat_msg.created_at.isoformat(),
                "role": chat_msg.role
            },
            room=room_name
        )

        # Signal tipkanja – stopped
        user_typing_status(room_name, "stopped", from_user_id)

    except Exception as e:
        logging.error(f"Greška pri slanju poruke: {e}")
        socketio.emit("message_response", {"error": "Došlo je do greške"})

# Servis za istoriju poruka
class ChatHistoryService:
    def __init__(self, current_user_id):
        self.current_user_id = current_user_id

    def get_conversation_with(self, other_user_id):
        messages = ChatMessage.query.filter(
            ((ChatMessage.user_id == self.current_user_id) & 
             (ChatMessage.id_primaoca == other_user_id)) |
            ((ChatMessage.user_id == other_user_id) & 
             (ChatMessage.id_primaoca == self.current_user_id))
        ).filter(ChatMessage.chat_type == "regular") \
         .order_by(ChatMessage.created_at.asc()) \
         .all()

        return [
            {
                "id": msg.id,
                "from_user": msg.user_id,
                "to_user": msg.id_primaoca,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]

# Ruta za istoriju poruka
@chat_bp.route('/history/<int:other_user_id>', methods=['GET'])
@jwt_required()
def get_history(other_user_id):
    current_user_id = get_jwt_identity()
    service = ChatHistoryService(current_user_id)
    history = service.get_conversation_with(other_user_id)
    return jsonify({"history": history})
