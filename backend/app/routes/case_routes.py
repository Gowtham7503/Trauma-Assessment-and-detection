from flask import (
    Blueprint,
    jsonify
)

from app.services.assessment_service import (
    get_assessment
)


case_bp = Blueprint(
    "cases",
    __name__,
    url_prefix="/api/cases"
)


@case_bp.route(
    "/<session_id>",
    methods=["GET"]
)
def get_case(
    session_id
):

    assessment = get_assessment(session_id)

    if not assessment:

        return jsonify({

            "success": False,

            "error":
                "Case not found."

        }), 404

    return jsonify({

        "success": True,

        "case":
            assessment

    }), 200
