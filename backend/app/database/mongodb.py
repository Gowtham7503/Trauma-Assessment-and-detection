from pymongo import MongoClient
from config.config import Config


client = MongoClient(Config.MONGODB_URI)


def get_database():
    return client.get_default_database()


db = get_database()


users_collection = db["users"]

cases_collection = db["cases"]

assessments_collection = db[
    "assessments"
]


def check_database_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False
        return False


def create_indexes():
    assessments_collection.create_index("session_id", unique=True)
