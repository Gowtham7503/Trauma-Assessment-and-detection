from app.services.llm_service import (
    MAX_CONVERSATION_QUESTIONS,
    count_assistant_questions,
    generate_chat_reply,
    has_reached_question_limit,
    normalize_messages,
)


def test_normalize_messages_accepts_frontend_chat_shape():
    messages = [
        {"sender": "bot", "text": "What happened?"},
        {"sender": "user", "text": "I keep feeling scared after an accident."},
    ]

    assert normalize_messages(messages) == [
        {"role": "assistant", "content": "What happened?"},
        {"role": "user", "content": "I keep feeling scared after an accident."},
    ]


def test_count_assistant_questions_ignores_user_questions():
    messages = [
        {"sender": "bot", "text": "What happened?"},
        {"sender": "user", "text": "Why do I feel scared?"},
        {"sender": "bot", "text": "Thank you for telling me."},
        {"sender": "bot", "text": "Do you feel safe right now?"},
    ]

    assert count_assistant_questions(messages) == 2


def test_generate_chat_reply_stops_at_question_limit(monkeypatch):
    messages = []

    for index in range(MAX_CONVERSATION_QUESTIONS):
        messages.append(
            {
                "sender": "bot",
                "text": f"Assessment question {index + 1}?",
            }
        )
        messages.append(
            {
                "sender": "user",
                "text": "Answer.",
            }
        )

    def fail_if_called(*args, **kwargs):
        raise AssertionError("LLM should not be called after question limit")

    monkeypatch.setattr(
        "app.services.llm_service.client.chat.completions.create",
        fail_if_called
    )

    assert has_reached_question_limit(messages)
    assert "stop asking questions" in generate_chat_reply(messages)
