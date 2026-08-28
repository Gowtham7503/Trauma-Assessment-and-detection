import json
import urllib.error
import urllib.request
from pathlib import Path

from config.config import Config


PROMPTS_DIR = Path(__file__).resolve().parents[3] / "ai" / "prompts"
PROMPT_PATHS = {
    "assessment": PROMPTS_DIR / "assessment_prompt.txt",
    "conversation": PROMPTS_DIR / "conversation_prompt.txt",
}
GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"


def load_prompt(prompt_name="assessment"):
    prompt_path = PROMPT_PATHS.get(prompt_name, PROMPT_PATHS["assessment"])
    return prompt_path.read_text(encoding="utf-8").strip()


def normalize_messages(messages):
    if isinstance(messages, str):
        return [{"role": "user", "content": messages}]

    normalized_messages = []
    for message in messages or []:
        role = message.get("role") or message.get("sender") or "user"
        content = message.get("content") or message.get("text") or ""

        if role == "bot":
            role = "assistant"

        if role in {"user", "assistant"} and content:
            normalized_messages.append({"role": role, "content": content})

    return normalized_messages


def generate_response(messages, prompt_name="assessment"):
    if not Config.GROQ_API_KEY:
        raise RuntimeError("Missing GROQ_API_KEY or GROQ_API in environment.")

    payload = {
        "model": Config.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": load_prompt(prompt_name)},
            *normalize_messages(messages),
        ],
        "temperature": 0.2,
        "max_tokens": 400,
    }

    request = urllib.request.Request(
        GROQ_CHAT_COMPLETIONS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {Config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Groq request failed with status {exc.code}: {body}") from exc

    return data["choices"][0]["message"]["content"]
