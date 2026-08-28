from app.services.llm_service import normalize_messages


def test_normalize_messages_accepts_frontend_chat_shape():
    messages = [
        {"sender": "bot", "text": "What happened?"},
        {"sender": "user", "text": "I keep feeling scared after an accident."},
    ]

    assert normalize_messages(messages) == [
        {"role": "assistant", "content": "What happened?"},
        {"role": "user", "content": "I keep feeling scared after an accident."},
    ]
