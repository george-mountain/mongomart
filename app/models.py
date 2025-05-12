from beanie import Document, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


class ItemModel(Document):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    owner_id: PydanticObjectId
    image_ids: Optional[List[PydanticObjectId]] = Field(default_factory=list)

    class Settings:
        collection = "mycollection"


class UserModel(Document):
    email: EmailStr
    hashed_password: str
    is_active: bool = True

    class Settings:
        collection = "users"
