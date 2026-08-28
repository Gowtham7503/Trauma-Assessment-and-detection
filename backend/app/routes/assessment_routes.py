from flask import Blueprint, jsonify, request


assessment_bp = Blueprint("assessment", __name__)


@assessment_bp.post("/")
def create_assessment():
    data = request.get_json(silent=True) or {}
    return jsonify({"assessment": data, "status": "created"})

