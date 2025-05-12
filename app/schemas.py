from typing import Optional, List
from beanie import PydanticObjectId
from pydantic import BaseModel, EmailStr


class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    image_ids: Optional[List[PydanticObjectId]] = None


class ItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    quantity: int
    owner_email: Optional[EmailStr]
    image_ids: Optional[List[PydanticObjectId]]


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    email: EmailStr
    is_active: bool = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class Login(BaseModel):
    email: EmailStr
    password: str


class FileResponse(BaseModel):
    file_id: PydanticObjectId
    filename: str
    content_type: str
    upload_date: str
    length: int
    message: str = "File uploaded successfully"
