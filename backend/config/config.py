import os


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/nhaa_trauma_assessment")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

