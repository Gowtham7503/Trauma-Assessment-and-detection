import os
from dotenv import load_dotenv


load_dotenv()


class Config:

    GROQ_API_KEY = os.getenv(
        "GROQ_API_KEY"
    )

    GROQ_MODEL = os.getenv(
        "GROQ_MODEL",
        "llama-3.3-70b-versatile"
    )

    GROQ_FALLBACK_MODEL = os.getenv(
        "GROQ_FALLBACK_MODEL",
        "llama-3.3-70b-versatile"
    )

    GROQ_SSL_VERIFY = (
        os.getenv(
            "GROQ_SSL_VERIFY",
            "true"
        ).lower()
        == "true"
    )

    PORT = int(
        os.getenv(
            "PORT",
            5000
        )
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )
