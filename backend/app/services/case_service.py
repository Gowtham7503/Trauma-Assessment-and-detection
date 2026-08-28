from datetime import datetime, timezone

from app.database.mongodb import cases_collection
from app.models.case_model import (
    create_case_document,
    serialize_case,
)


def create_case(session_id, complaint, user_id=None):
    document = create_case_document(
        session_id=session_id,
        complaint=complaint,
        user_id=user_id,
    )

    result = cases_collection.insert_one(document)

    document["_id"] = result.inserted_id

    return serialize_case(document)


def get_case(session_id):
    document = cases_collection.find_one({
        "session_id": session_id
    })

    return serialize_case(document)


def update_case(session_id, updates):
    updates["updated_at"] = datetime.now(timezone.utc)

    cases_collection.update_one(
        {"session_id": session_id},
        {"$set": updates},
    )

    return get_case(session_id)