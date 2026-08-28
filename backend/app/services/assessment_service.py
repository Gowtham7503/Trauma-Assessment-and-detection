import json

from app.database.mongodb import (
    assessments_collection
)

from app.services.llm_service import (
    generate_questions,
    generate_final_assessment
)

from app.services.safety_service import (
    basic_safety_screen
)

from app.utils.pii_masking import (
    mask_pii
)

from datetime import datetime, timezone

from pymongo.errors import DuplicateKeyError

from app.database.mongodb import assessments_collection
from app.models.assessment_model import (
    create_assessment_document,
    serialize_assessment,
)

from app.services.llm_service import (
    generate_questions,
    generate_final_assessment
)

from app.services.safety_service import (
    basic_safety_screen
)

from app.utils.pii_masking import (
    mask_pii
)


def summarize_assessment(responses):
    return {"responses": responses, "risk_level": "pending"}


# ==================================================
# START ASSESSMENT
# Complaint → Safety Check → Groq → Questions
# ==================================================

def start_assessment(
    session_id,
    complaint
):

    # ----------------------------------------------
    # 1. Mask basic PII
    # ----------------------------------------------

    safe_complaint = mask_pii(
        complaint
    )


    # ----------------------------------------------
    # 2. Safety screening
    # ----------------------------------------------

    safety = basic_safety_screen(
        safe_complaint
    )


    if safety["flagged"]:

        return {

            "status": "safety",

            "safety": True,

            "message": (
                "The information provided "
                "may indicate an immediate "
                "safety concern. Please seek "
                "urgent support from local "
                "emergency services or a "
                "qualified professional."
            )
        }


    # ----------------------------------------------
    # 3. Generate questions using Groq
    # ----------------------------------------------

    questions_result = (
        generate_questions(
            safe_complaint
        )
    )


    if "questions" not in questions_result:

        raise ValueError(
            "No questions were generated."
        )


    questions = (
        questions_result["questions"]
    )


    # ----------------------------------------------
    # 4. Save assessment in MongoDB
    # ----------------------------------------------

    assessment = {

        "session_id":
            session_id,

        "complaint":
            safe_complaint,

        "questions":
            questions,

        "answers":
            [],

        "result":
            None,

        "status":
            "questions_generated"
    }


    assessments_collection.insert_one(
        assessment
    )


    # ----------------------------------------------
    # 5. Return questions to frontend
    # ----------------------------------------------

    return {

        "status":
            "questions_generated",

        "safety":
            False,

        "questions":
            questions
    }


# ==================================================
# COMPLETE ASSESSMENT
# Answers → Groq → Final Result → MongoDB
# ==================================================

def complete_assessment(
    session_id,
    answers
):

    # ----------------------------------------------
    # 1. Find assessment
    # ----------------------------------------------

    assessment = (
        assessments_collection.find_one(
            {
                "session_id":
                    session_id
            }
        )
    )


    if not assessment:

        raise ValueError(
            "Assessment session not found."
        )


    # ----------------------------------------------
    # 2. Validate assessment state
    # ----------------------------------------------

    if not assessment.get(
        "questions"
    ):

        raise ValueError(
            "No questions found for this assessment."
        )


    # ----------------------------------------------
    # 3. Get original complaint
    # ----------------------------------------------

    complaint = (
        assessment.get(
            "complaint",
            ""
        )
    )


    # ----------------------------------------------
    # 4. Get generated questions
    # ----------------------------------------------

    questions = (
        assessment.get(
            "questions",
            []
        )
    )


    # ----------------------------------------------
    # 5. Generate final assessment
    # ----------------------------------------------

    result = (
        generate_final_assessment(

            complaint=
                complaint,

            questions=
                questions,

            answers=
                answers
        )
    )


    # ----------------------------------------------
    # 6. Save answers + result
    # ----------------------------------------------

    assessments_collection.update_one(

        {
            "session_id":
                session_id
        },

        {
            "$set": {

                "answers":
                    answers,

                "result":
                    result,

                "status":
                    "completed"
            }
        }
    )


    # ----------------------------------------------
    # 7. Return result
    # ----------------------------------------------

    return result
    return result
def create_assessment(
    session_id,
    complaint,
    questions=None,
):
    document = create_assessment_document(
        session_id=session_id,
        complaint=complaint,
        questions=questions,
    )

    try:
        result = assessments_collection.insert_one(document)

    except DuplicateKeyError:
        return get_assessment(session_id)

    document["_id"] = result.inserted_id

    return serialize_assessment(document)


def get_assessment(session_id):
    document = assessments_collection.find_one({
        "session_id": session_id
    })

    return serialize_assessment(document)


def save_questions(session_id, questions):
    assessments_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "questions": questions,
                "status": "questions_generated",
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )

    return get_assessment(session_id)


def save_answers(session_id, answers):
    assessments_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "answers": answers,
                "status": "answers_submitted",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return get_assessment(session_id)


def save_assessment_result(session_id, result):
    assessments_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "result": result,
                "status": "completed",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return get_assessment(session_id)
