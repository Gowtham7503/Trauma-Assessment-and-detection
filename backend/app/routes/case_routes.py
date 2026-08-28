from flask import Blueprint, jsonify


case_bp = Blueprint("cases", __name__)


@case_bp.get("/")
def list_cases():
    return jsonify({"cases": []})

