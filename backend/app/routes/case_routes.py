from flask import (
    Blueprint,
    jsonify
)

from app.database.mongodb import (
    assessments_collection
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

    assessment = (
        assessments_collection.find_one(

            {
                "session_id":
                    session_id
            },

            {
                "_id": 0
            }

        )
    )

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