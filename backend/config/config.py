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

    GROQ_SSL_VERIFY = (
        os.getenv(
            "GROQ_SSL_VERIFY",
            "true"
        ).lower()
        == "true"
    )

    MONGODB_URI = os.getenv(
        "MONGODB_URI",
        "mongodb://localhost:27017"
    )

    MONGODB_DATABASE = os.getenv(
        "MONGODB_DATABASE",
        "nhaa_trauma_assessment"
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
