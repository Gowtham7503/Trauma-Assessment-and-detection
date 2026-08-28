from flask import Blueprint, jsonify, request


chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/")
def chat():
    data = request.get_json(silent=True) or {}
    return jsonify({"reply": "Chat service scaffold is ready.", "input": data})

