from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse, StreamingResponse

from beanie import PydanticObjectId

from app.crud import (
    create_item,
    get_item,
    get_all_items,
    update_item,
    delete_item,
    upload_file_to_gridfs,
    get_gridfs_file,
    delete_gridfs_file,
    associate_image_with_item,
    disassociate_image_from_item,
)
from app.models import (
    ItemModel,
    UserModel,
)

from app.schemas import (
    ItemCreate,
    UserCreate,
    UserResponse,
    Token,
    Login,
    ItemUpdate,
    ItemResponse,
    FileResponse as AppFileResponse,
)
from app.database import (
    init_db,
)
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from typing import List, Optional, Dict, Any


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI app."""
    await init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="FastAPI with Beanie, MongoDB, and GridFS",
    description="A FastAPI app with Beanie ODM, MongoDB, and GridFS for file uploads",
    version="1.1.0",
    default_response_class=ORJSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Authentication Endpoints ---
@app.post("/login", response_model=Token)
async def login(login_data: Login):
    """Login endpoint to authenticate users and return JWT token."""
    user = await UserModel.find_one(UserModel.email == login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")


@app.post("/signup", response_model=UserResponse)
async def signup_user(
    user_data: UserCreate,
):
    """Signup endpoint to create a new user."""
    existing_user = await UserModel.find_one(UserModel.email == user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user_data.password)
    new_user = UserModel(email=user_data.email, hashed_password=hashed_password)
    await new_user.insert()
    return UserResponse(email=new_user.email, is_active=new_user.is_active)


# --- Item Endpoints ---
@app.post("/items", summary="Create a new item")
async def create_new_item_endpoint(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    quantity: int = Form(...),
    files: List[UploadFile] = File(
        default=None, description="Optional images for the item"
    ),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Create a new item. You can optionally upload one or more image files.
    """
    item_data = ItemCreate(
        name=name, description=description, price=price, quantity=quantity
    )
    uploaded_image_ids: List[PydanticObjectId] = []
    if files:
        for file_upload in files:
            if file_upload.filename:
                file_response = await upload_file_to_gridfs(
                    file_upload, owner_id=current_user.id
                )
                uploaded_image_ids.append(file_response.file_id)

    return await create_item(
        item_data, owner_id=current_user.id, image_ids=uploaded_image_ids
    )


@app.get("/items/{item_id}", response_model=ItemResponse, summary="Get an item by ID")
async def read_item_endpoint(
    item_id: str, current_user: UserModel = Depends(get_current_user)
):
    """Retrieve an item by ID. User must own the item."""
    item = await get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if str(item["owner_id"]) != str(current_user.id):
        raise HTTPException(
            status_code=403, detail="You do not have permission to access this item."
        )
    return item


@app.get("/items", response_model=List[ItemModel], summary="Get all items (public)")
async def read_all_items_endpoint():
    """Retrieve all items. This endpoint is public."""
    return await get_all_items()


@app.get(
    "/user/items",
    response_model=List[ItemModel],
    summary="Get items for the current user",
)
async def read_user_items_endpoint(current_user: UserModel = Depends(get_current_user)):
    """Retrieve all items owned by the currently authenticated user."""
    items = await ItemModel.find(ItemModel.owner_id == current_user.id).to_list()
    return items


@app.put("/items/{item_id}", summary="Update an item")
async def modify_item_endpoint(
    item_id: str,
    item_update_data: ItemUpdate,
    current_user: UserModel = Depends(get_current_user),
):
    """Update an item's details. User must own the item.
    To remove all images, pass `image_ids: []`.
    To change images, pass a new list of `image_ids`.
    """
    update_data_dict = item_update_data.model_dump(exclude_unset=True)
    if not update_data_dict:
        raise HTTPException(status_code=400, detail="No update data provided.")
    return await update_item(item_id, update_data_dict, owner_id=current_user.id)


@app.delete("/items/{item_id}", summary="Delete an item")
async def remove_item_endpoint(
    item_id: str, current_user: UserModel = Depends(get_current_user)
):
    """Delete an item by ID. User must own the item. Associated files in GridFS will also be deleted."""
    return await delete_item(item_id, owner_id=current_user.id)


# --- File/Image Endpoints ---


@app.post("/uploadfile", response_model=AppFileResponse, summary="Upload a single file")
async def upload_a_file(
    file: UploadFile = File(...), current_user: UserModel = Depends(get_current_user)
):
    """
    Upload a single file to GridFS. The file will be associated with the uploading user.
    This endpoint is generic for file uploads. To associate with an item,
    use the `/items/{item_id}/associate-image/` endpoint or upload during item creation.
    """
    return await upload_file_to_gridfs(file, owner_id=current_user.id)


@app.get("/file/{file_id}", summary="Download a file by ID")
async def get_file_by_id(
    file_id: PydanticObjectId,
):
    """
    Retrieve a file from GridFS by its ID.
    Currently public, add `current_user` dependency and check `grid_out.metadata.get("owner_id")`
    if you want to restrict access.
    """
    grid_out = await get_gridfs_file(file_id)

    response = StreamingResponse(
        grid_out,
        media_type=grid_out.metadata.get("content_type", "application/octet-stream"),
    )
    # Set filename for download
    response.headers["Content-Disposition"] = (
        f'attachment; filename="{grid_out.filename}"'
    )
    return response


@app.delete("/file/{file_id}", summary="Delete a file by ID")
async def delete_a_file(
    file_id: PydanticObjectId, current_user: UserModel = Depends(get_current_user)
):
    """
    Delete a file from GridFS by its ID. User must own the file.
    Note: This only deletes the file from GridFS. If it's linked to an item,
    you might want to also call an endpoint to disassociate it from the item.
    """

    return await delete_gridfs_file(file_id, owner_id=current_user.id)


# --- Endpoints to link/unlink images from items ---
@app.post(
    "/items/{item_id}/associate-image/{image_id}",
    summary="Associate an image with an item",
)
async def associate_image_endpoint(
    item_id: str,
    image_id: PydanticObjectId,
    current_user: UserModel = Depends(get_current_user),
):
    """Associate an existing GridFS image (by its file_id) with an item."""

    try:
        grid_out = await get_gridfs_file(image_id)
        if grid_out.metadata and grid_out.metadata.get("owner_id") != str(
            current_user.id
        ):
            raise HTTPException(
                status_code=403, detail="You do not own this image to associate it."
            )
    except HTTPException as e:
        if e.status_code == 404:
            raise HTTPException(
                status_code=404, detail=f"Image with ID {image_id} not found."
            )
        raise e

    return await associate_image_with_item(item_id, image_id, current_user.id)


@app.delete(
    "/items/{item_id}/disassociate-image/{image_id}",
    summary="Disassociate an image from an item",
)
async def disassociate_image_endpoint(
    item_id: str,
    image_id: PydanticObjectId,
    current_user: UserModel = Depends(get_current_user),
):
    """Disassociate an image from an item. This does NOT delete the image from GridFS."""
    return await disassociate_image_from_item(item_id, image_id, current_user.id)
