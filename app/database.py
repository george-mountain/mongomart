from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from beanie import init_beanie
from app.models import ItemModel, UserModel
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://admin:password@mongodb:27017")

client = AsyncIOMotorClient(MONGO_URL)
database = client["mydatabase"]

# Initialize GridFS
grid_fs = AsyncIOMotorGridFSBucket(
    database, bucket_name="fs"
)  # "fs" is the default bucket name

document_models = [ItemModel, UserModel]


async def init_db():
    """Initialize Beanie ODM with the MongoDB database."""
    await init_beanie(database, document_models=document_models)
