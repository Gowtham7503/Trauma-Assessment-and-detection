from app.database.memory_store import (
    get_case_document,
    save_case_document,
    update_case_document,
)
from app.models.case_model import (
    create_case_document,
)


def create_case(session_id, complaint, user_id=None):
    document = create_case_document(
        session_id=session_id,
        complaint=complaint,
        user_id=user_id,
    )

    return save_case_document(document)


def get_case(session_id):
    return get_case_document(session_id)


def update_case(session_id, updates):
    return update_case_document(session_id, updates)
