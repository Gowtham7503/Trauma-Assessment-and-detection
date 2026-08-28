from flask import (
    Blueprint,
    request,
    jsonify
)

from app.utils.helpers import (
    generate_session_id
)

from app.utils.validators import (
    validate_complaint
)

from app.services.assessment_service import (
    start_assessment
)


chat_bp = Blueprint(
    "chat",
    __name__,
    url_prefix="/api/chat"
)


@chat_bp.route(
    "/start",
    methods=["POST"]
)
def start_chat():

    data = (
        request.get_json(
            silent=True
        ) or {}
    )

    complaint = data.get(
        "complaint",
        ""
    )

    valid, error = (
        validate_complaint(
            complaint
        )
    )

    if not valid:

        return jsonify({

            "success": False,

            "error": error

        }), 400

    session_id = (
        generate_session_id()
    )

    try:

        result = start_assessment(

            session_id,

            complaint

        )

        return jsonify({

            "success": True,

            "session_id":
                session_id,

            **result

        }), 200

    except Exception as e:

        print(
            "Chat error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to process "
                "the complaint."

        }), 500