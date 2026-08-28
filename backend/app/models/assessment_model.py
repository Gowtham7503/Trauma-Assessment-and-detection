from datetime import datetime, timezone


def create_assessment_document(
    session_id,
    complaint,
    questions=None,
    answers=None,
):
    now = datetime.now(timezone.utc)

    return {
        "session_id": session_id,
        "complaint": complaint,
        "questions": questions or [],
        "answers": answers or [],
        "result": None,
        "status": "questions_generated",
        "created_at": now,
        "updated_at": now,
    }


def serialize_assessment(document):
    if not document:
        return None

    result = dict(document)

    for field in ("created_at", "updated_at"):
        if field in result and hasattr(result[field], "isoformat"):
            result[field] = result[field].isoformat()

    return result
