from flask import Blueprint, jsonify, request

from app.services.llm_service import generate_response


chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/")
def chat():
    data = request.get_json(silent=True) or {}
    messages = data.get("messages") or data.get("message") or []
    reply = generate_response(messages, prompt_name="conversation")
    return jsonify({"reply": reply})
