from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError
import certifi

from app.core.config import settings

_client: MongoClient | None = None
_mongo_unavailable = False


def connect_to_mongo() -> MongoClient | None:
    global _client, _mongo_unavailable
    if _mongo_unavailable:
        return None
    if _client is None:
        if not settings.mongo_uri.strip():
            _mongo_unavailable = True
            return None
        try:
            _client = MongoClient(
                settings.mongo_uri,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=1500,
                connectTimeoutMS=1500,
            )
            _client.admin.command("ping")
        except PyMongoError:
            _mongo_unavailable = True
            _client = None
            return None
    return _client


def get_database() -> Database | None:
    client = connect_to_mongo()
    if client is None:
        return None
    return client[settings.mongo_db_name]


def close_mongo_connection() -> None:
    global _client, _mongo_unavailable
    if _client is not None:
        _client.close()
        _client = None
    _mongo_unavailable = False
