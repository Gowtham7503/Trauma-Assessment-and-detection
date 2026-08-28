from app.services.llm_service import (
    MAX_CONVERSATION_QUESTIONS,
    create_chat_completion,
    count_assistant_questions,
    generate_chat_reply,
    has_reached_question_limit,
    is_feedback_ready_reply,
    is_retryable_generation_error,
    normalize_messages,
)
from groq import BadRequestError
import httpx


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


def test_is_feedback_ready_reply_detects_summary_handoff():
    assert is_feedback_ready_reply(
        "Thank you. I have enough to prepare a brief screening summary now."
    )
    assert not is_feedback_ready_reply(
        "That sounds difficult. How has your sleep been this week?"
    )


def test_output_parse_failed_retries_with_fallback_model(monkeypatch):
    calls = []

    error_response = httpx.Response(
        400,
        request=httpx.Request(
            "POST",
            "https://api.groq.com/openai/v1/chat/completions",
        ),
    )
    parse_error = BadRequestError(
        "Parsing failed.",
        response=error_response,
        body={
            "error": {
                "code": "output_parse_failed"
            }
        },
    )

    expected_response = object()

    def fake_create(**kwargs):
        calls.append(kwargs["model"])

        if len(calls) == 1:
            raise parse_error

        return expected_response

    monkeypatch.setattr(
        "app.services.llm_service.Config.GROQ_FALLBACK_MODEL",
        "llama-3.3-70b-versatile"
    )
    monkeypatch.setattr(
        "app.services.llm_service.client.chat.completions.create",
        fake_create
    )

    assert is_retryable_generation_error(parse_error)
    assert create_chat_completion(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": "Hello"
            }
        ],
    ) is expected_response
    assert calls == [
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile"
    ]
