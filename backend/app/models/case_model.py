from datetime import datetime, timezone


def create_case_document(
    session_id,
    complaint,
    user_id=None,
):
    now = datetime.now(timezone.utc)

    return {
        "session_id": session_id,
        "user_id": user_id,
        "complaint": complaint,
        "created_at": now,
        "updated_at": now,
    }


def serialize_case(document):
    if not document:
        return None

    result = dict(document)

    for field in ("created_at", "updated_at"):
        if field in result and hasattr(result[field], "isoformat"):
            result[field] = result[field].isoformat()

    return result
