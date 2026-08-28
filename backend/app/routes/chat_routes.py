from flask import (
    Blueprint,
    current_app,
    request,
    jsonify
)

from groq import APIConnectionError

from app.utils.helpers import (
    generate_session_id
)

from app.utils.validators import (
    validate_complaint
)

from app.services.assessment_service import (
    start_assessment
)

from app.services.llm_service import (
    generate_chat_feedback,
    generate_chat_reply,
    has_reached_question_limit,
    is_feedback_ready_reply
)


chat_bp = Blueprint(
    "chat",
    __name__,
    url_prefix="/api/chat"
)


@chat_bp.route(
    "/",
    methods=["POST"]
)
def continue_chat():

    data = (
        request.get_json(
            silent=True
        ) or {}
    )

    messages = data.get(
        "messages",
        []
    )

    if not isinstance(
        messages,
        list
    ):

        return jsonify({

            "success": False,

            "error":
                "messages must be a list."

        }), 400

    try:

        reply = generate_chat_reply(
            messages
        )

        return jsonify({

            "success": True,

            "reply": reply,

            "readyForFeedback": (
                has_reached_question_limit(
                    messages
                )
                or is_feedback_ready_reply(
                    reply
                )
            )

        }), 200

    except APIConnectionError as e:

        print(
            "Groq connection error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to connect to "
                "the Groq API."

        }), 503

    except Exception as e:

        print(
            "Chat reply error:",
            str(e)
        )

        response = {

            "success": False,

            "error":
                "Unable to generate "
                "a chat response."

        }

        if current_app.debug:
            response["detail"] = str(e)

        return jsonify(response), 500


@chat_bp.route(
    "/feedback",
    methods=["POST"]
)
def chat_feedback():

    data = (
        request.get_json(
            silent=True
        ) or {}
    )

    messages = data.get(
        "messages",
        []
    )

    if not isinstance(
        messages,
        list
    ):

        return jsonify({

            "success": False,

            "error":
                "messages must be a list."

        }), 400

    try:

        feedback = generate_chat_feedback(
            messages
        )

        return jsonify({

            "success": True,

            "feedback": feedback

        }), 200

    except APIConnectionError as e:

        print(
            "Groq feedback connection error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error":
                "Unable to connect to "
                "the Groq API."

        }), 503

    except Exception as e:

        print(
            "Chat feedback error:",
            str(e)
        )

        response = {

            "success": False,

            "error":
                "Unable to generate "
                "chat feedback from the API."

        }

        if current_app.debug:
            response["detail"] = str(e)

        return jsonify(response), 500


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

        response = {

            "success": False,

            "error":
                "Unable to process "
                "the complaint."

        }

        if current_app.debug:
            response["detail"] = str(e)

        return jsonify(response), 500
