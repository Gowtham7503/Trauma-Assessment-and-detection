from pymongo import MongoClient

from config.config import Config


def get_database():
    client = MongoClient(Config.MONGODB_URI)
    return client.get_default_database()

