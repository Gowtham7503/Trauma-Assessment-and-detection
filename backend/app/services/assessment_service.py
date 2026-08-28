from app.database.memory_store import (
    get_assessment_document,
    save_assessment_document,
    update_assessment_document,
)
from app.models.assessment_model import create_assessment_document
from app.services.llm_service import (
    generate_final_assessment,
    generate_questions,
)
from app.services.safety_service import basic_safety_screen
from app.utils.pii_masking import mask_pii


def summarize_assessment(responses):
    return {"responses": responses, "risk_level": "pending"}


def start_assessment(session_id, complaint):
    safe_complaint = mask_pii(complaint)
    safety = basic_safety_screen(safe_complaint)

    if safety["flagged"]:
        return {
            "status": "safety",
            "safety": True,
            "message": (
                "The information provided may indicate an immediate safety concern. "
                "Please seek urgent support from local emergency services or a "
                "qualified professional."
            ),
        }

    questions_result = generate_questions(safe_complaint)

    if "questions" not in questions_result:
        raise ValueError("No questions were generated.")

    questions = questions_result["questions"]
    document = create_assessment_document(
        session_id=session_id,
        complaint=safe_complaint,
        questions=questions,
    )
    save_assessment_document(document)

    return {
        "status": "questions_generated",
        "safety": False,
        "questions": questions,
    }


def complete_assessment(session_id, answers):
    assessment = get_assessment_document(session_id)

    if not assessment:
        raise ValueError("Assessment session not found.")

    if not assessment.get("questions"):
        raise ValueError("No questions found for this assessment.")

    result = generate_final_assessment(
        complaint=assessment.get("complaint", ""),
        questions=assessment.get("questions", []),
        answers=answers,
    )

    update_assessment_document(
        session_id,
        {
            "answers": answers,
            "result": result,
            "status": "completed",
        },
    )

    return result


def create_assessment(session_id, complaint, questions=None):
    existing_assessment = get_assessment_document(session_id)

    if existing_assessment:
        return existing_assessment

    document = create_assessment_document(
        session_id=session_id,
        complaint=complaint,
        questions=questions,
    )

    return save_assessment_document(document)


def get_assessment(session_id):
    return get_assessment_document(session_id)


def save_questions(session_id, questions):
    return update_assessment_document(
        session_id,
        {
            "questions": questions,
            "status": "questions_generated",
        },
        upsert=True,
    )


def save_answers(session_id, answers):
    return update_assessment_document(
        session_id,
        {
            "answers": answers,
            "status": "answers_submitted",
        },
    )


def save_assessment_result(session_id, result):
    return update_assessment_document(
        session_id,
        {
            "result": result,
            "status": "completed",
        },
    )
