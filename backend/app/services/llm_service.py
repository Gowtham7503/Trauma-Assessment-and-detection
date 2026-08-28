import json

import httpx

from groq import Groq

from config.config import Config


# ---------------------------------------------
# GROQ CLIENT
# ---------------------------------------------

if not Config.GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing from .env"
    )


client = Groq(
    api_key=Config.GROQ_API_KEY,
    http_client=httpx.Client(
        trust_env=False,
        verify=Config.GROQ_SSL_VERIFY
    )
)


def normalize_messages(messages):
    role_map = {
        "bot": "assistant",
        "assistant": "assistant",
        "user": "user",
        "system": "system"
    }

    normalized = []

    for message in messages:
        sender = (
            message.get("sender")
            or message.get("role")
            or "user"
        )

        content = (
            message.get("text")
            or message.get("content")
            or ""
        )

        normalized.append(
            {
                "role": role_map.get(
                    sender,
                    sender
                ),
                "content": content
            }
        )

    return normalized


CONVERSATION_SYSTEM_PROMPT = """
You are an AI-assisted trauma screening counsellor for an authorized support service.

Your job is to understand the specific incident the user is describing.
Keep the conversation centered on that incident and the user's direct experience of it.
Ask follow-up questions based only on details the user has already shared.

Rules:

1. Do not diagnose PTSD, trauma, depression, anxiety, or any other condition.
2. Do not give broad advice, life coaching, education, or unrelated commentary.
3. Do not invent events, symptoms, relationships, causes, or risks the user did not mention.
4. Ask only one question at a time.
5. Keep the response brief, warm, and direct.
6. If the user's answer is vague, ask a simple clarification about the incident.
7. Do not switch to symptom checklists unless the user has already mentioned symptoms or impact.
8. Do not ask about work, school, sleep, relationships, coping, or support unless the user brings up that area.
9. If there is possible immediate danger, self-harm, harm to others, abuse, or inability to stay safe,
   briefly prioritize safety and ask whether they can contact emergency help or a trusted person now.
10. Do not ask for graphic details.
11. Every non-crisis response must end with exactly one question.
12. Prefer specific questions over broad prompts like "tell me more" or "can you share more".

Incident-focused areas to ask about:

- what happened, in the user's own words
- when or where it happened, only if it helps clarify the incident
- who was involved, only if the user has already mentioned another person
- what part of the incident is most upsetting or confusing to them
- what they remember noticing, feeling, or doing during the incident
- what happened immediately after the incident
- whether they feel safe now, only if the incident suggests current danger or the user sounds unsafe

Avoid these unless directly relevant to the user's own words:

- general trauma education
- broad mental-health screening
- diagnosis-like language
- long reassurance
- repeated requests to describe the incident in detail

Return only the chatbot message as plain text.
"""


def generate_chat_reply(messages):
    normalized_messages = normalize_messages(
        messages
    )

    response = client.chat.completions.create(

        model=Config.GROQ_MODEL,

        messages=[
            {
                "role": "system",
                "content": CONVERSATION_SYSTEM_PROMPT
            },
            *normalized_messages
        ],

        temperature=0.2
    )

    reply = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )

    if not reply:
        raise ValueError(
            "Groq returned an empty chat response."
        )

    return reply


def generate_chat_feedback(messages):
    normalized_messages = normalize_messages(
        messages
    )

    feedback_prompt = f"""
{CONVERSATION_SYSTEM_PROMPT}

The conversation is ending now. Based only on the user's messages in this conversation,
prepare brief supportive feedback for a trauma-screening prototype.

Do not diagnose. Do not invent details. Do not use scripted recommendations.
Return ONLY valid JSON with this structure:

{{
    "summary": "short plain-language summary of what the user shared",
    "riskLevel": "Low | Moderate | High | Unclear",
    "recommendations": [
        "supportive next step based on the conversation",
        "supportive next step based on the conversation"
    ],
    "backendReply": "one brief closing counselling-style response"
}}
"""

    response = client.chat.completions.create(

        model=Config.GROQ_MODEL,

        messages=[
            {
                "role": "system",
                "content": feedback_prompt
            },
            *normalized_messages
        ],

        temperature=0.2,

        response_format={
            "type": "json_object"
        }
    )

    output = (
        response
        .choices[0]
        .message
        .content
    )

    try:

        return json.loads(
            output
        )

    except json.JSONDecodeError:

        raise ValueError(
            "Groq returned invalid feedback JSON."
        )


# ---------------------------------------------
# GENERATE QUESTIONS
# ---------------------------------------------

def generate_questions(complaint):

    system_prompt = """
You are an AI assistant supporting a
trauma-assessment research prototype.

The user has provided a personal complaint.

Your task is to generate relevant
follow-up assessment questions based
ONLY on information provided in the complaint.

IMPORTANT RULES:

1. Do not diagnose the user.

2. Do not claim that the user has PTSD,
   depression, anxiety, or any other disorder.

3. Do not assume facts that the user
   did not provide.

4. Questions must be neutral,
   respectful and non-leading.

5. Avoid unnecessarily graphic questions.

6. Generate between 10 and 15 questions.

7. Questions should explore relevant
   experiences and their possible impact
   on daily functioning.

8. Include a safety-oriented question
   when the complaint reasonably suggests
   a possible safety concern.

9. Use simple language.

10. Return ONLY valid JSON.

The JSON must follow this structure:

{
    "questions": [
        {
            "id": 1,
            "question": "Question text",
            "type": "scale",
            "options": [
                "Never",
                "Rarely",
                "Sometimes",
                "Often",
                "Very often"
            ]
        }
    ]
}

Allowed question types:

"text"
"yes_no"
"scale"
"multiple_choice"

For type "text", options should be [].

For type "yes_no", options should be:
["Yes", "No"]

For type "scale", provide appropriate
frequency/intensity options.

For type "multiple_choice", provide
appropriate choices.
"""

    user_prompt = f"""
Here is the user's complaint:

{complaint}

Generate the relevant follow-up
assessment questions.
"""

    response = client.chat.completions.create(

        model=Config.GROQ_MODEL,

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],

        temperature=0.3,

        response_format={
            "type": "json_object"
        }
    )

    output = (
        response
        .choices[0]
        .message
        .content
    )

    try:

        result = json.loads(
            output
        )

    except json.JSONDecodeError:

        raise ValueError(
            "Groq returned invalid JSON."
        )

    if "questions" not in result:

        raise ValueError(
            "Groq response does not contain questions."
        )

    return result


# ---------------------------------------------
# FINAL ASSESSMENT
# ---------------------------------------------

def generate_final_assessment(
    complaint,
    questions,
    answers
):

    system_prompt = """
You are an AI assistant used in a
trauma-assessment research prototype.

Analyze the user's complaint and answers.

IMPORTANT:

This system is NOT a diagnostic system.

Do not diagnose PTSD, depression,
anxiety disorders, or any other
medical condition.

Instead:

- summarize reported experiences
- identify areas that may warrant attention
- identify possible functional impact
- provide a broad risk level
- suggest appropriate next steps
- identify possible safety concerns when
  supported by the information

Do not invent information.

Return ONLY valid JSON.

Required structure:

{
    "summary": "string",
    "risk_level": "low",
    "areas_of_concern": [],
    "observations": [],
    "recommendations": [],
    "emergency_guidance": null
}

risk_level MUST be one of:

low
moderate
high
unclear
"""

    user_prompt = f"""
USER COMPLAINT:

{complaint}


ASSESSMENT QUESTIONS:

{json.dumps(
    questions,
    indent=2
)}


USER ANSWERS:

{json.dumps(
    answers,
    indent=2
)}


Generate the final assessment.
"""

    response = client.chat.completions.create(

        model=Config.GROQ_MODEL,

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],

        temperature=0.2,

        response_format={
            "type": "json_object"
        }
    )

    output = (
        response
        .choices[0]
        .message
        .content
    )

    try:

        return json.loads(
            output
        )

    except json.JSONDecodeError:

        raise ValueError(
            "Groq returned invalid assessment JSON."
        )
