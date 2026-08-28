from pymongo import MongoClient
from config.config import Config


client = MongoClient(
    Config.MONGODB_URI
)


db = client[
    Config.MONGODB_DATABASE
]


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