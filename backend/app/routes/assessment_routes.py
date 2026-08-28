from flask import (
    Blueprint,
    request,
    jsonify
)

from app.utils.validators import (
    validate_answers
)

from app.services.assessment_service import (
    complete_assessment
)


assessment_bp = Blueprint(
    "assessment",
    __name__,
    url_prefix="/api/assessment"
)


@assessment_bp.route(
    "/submit",
    methods=["POST"]
)
def submit_assessment():

    data = (
        request.get_json(
            silent=True
        ) or {}
    )

    session_id = data.get(
        "session_id"
    )

    answers = data.get(
        "answers"
    )

    if not session_id:

        return jsonify({

            "success": False,

            "error":
                "session_id is required."

        }), 400

    valid, error = (
        validate_answers(
            answers
        )
    )

    if not valid:

        return jsonify({

            "success": False,

            "error": error

        }), 400

    try:

        result = (
            complete_assessment(

                session_id,

                answers

            )
        )

        return jsonify({

            "success": True,

            "session_id":
                session_id,

            "result":
                result

        }), 200

    except ValueError as e:

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 404

    except Exception as e:

        print(
            "Assessment error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to complete "
                "assessment."

        }), 500