import json

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
    api_key=Config.GROQ_API_KEY
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