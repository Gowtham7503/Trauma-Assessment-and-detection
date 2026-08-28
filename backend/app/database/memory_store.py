from copy import deepcopy
from datetime import datetime, timezone


_assessments = {}
_cases = {}


def _now():
    return datetime.now(timezone.utc)


def _serialize(document):
    if not document:
        return None

    result = deepcopy(document)

    for field in ("created_at", "updated_at"):
        if field in result and hasattr(result[field], "isoformat"):
            result[field] = result[field].isoformat()

    return result


def save_assessment_document(document):
    session_id = document["session_id"]
    now = _now()
    stored_document = {
        **deepcopy(document),
        "updated_at": now,
    }

    if "created_at" not in stored_document:
        stored_document["created_at"] = now

    _assessments[session_id] = stored_document

    return _serialize(stored_document)


def get_assessment_document(session_id):
    return _serialize(_assessments.get(session_id))


def update_assessment_document(session_id, updates, upsert=False):
    document = _assessments.get(session_id)

    if not document and not upsert:
        return None

    if not document:
        now = _now()
        document = {
            "session_id": session_id,
            "complaint": "",
            "questions": [],
            "answers": [],
            "result": None,
            "status": "created",
            "created_at": now,
            "updated_at": now,
        }

    document.update(deepcopy(updates))
    document["updated_at"] = _now()
    _assessments[session_id] = document

    return _serialize(document)


def save_case_document(document):
    session_id = document["session_id"]
    now = _now()
    stored_document = {
        **deepcopy(document),
        "updated_at": now,
    }

    if "created_at" not in stored_document:
        stored_document["created_at"] = now

    _cases[session_id] = stored_document

    return _serialize(stored_document)


def get_case_document(session_id):
    return _serialize(_cases.get(session_id))


def update_case_document(session_id, updates):
    document = _cases.get(session_id)

    if not document:
        return None

    document.update(deepcopy(updates))
    document["updated_at"] = _now()
    _cases[session_id] = document

    return _serialize(document)
