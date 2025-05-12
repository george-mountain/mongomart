from fastapi import UploadFile, HTTPException
from app.models import ItemModel, UserModel
from app.schemas import ItemCreate, FileResponse
from beanie import PydanticObjectId

from app.database import grid_fs
from bson import ObjectId
from typing import Dict, Any, List, Optional


# --- File/Image CRUD Operations ---
async def upload_file_to_gridfs(
    file: UploadFile, owner_id: PydanticObjectId
) -> FileResponse:
    """Uploads a file to GridFS and returns its ID and metadata."""
    try:

        file_id = await grid_fs.upload_from_stream(
            file.filename,
            file.file,
            metadata={
                "content_type": file.content_type,
                "owner_id": str(owner_id),
            },
        )
        # Retrieve the uploaded file's metadata to return more info
        grid_out = await grid_fs.open_download_stream(file_id)

        return FileResponse(
            file_id=PydanticObjectId(file_id),  # Convert ObjectId to PydanticObjectId
            filename=grid_out.filename,
            content_type=grid_out.metadata.get(
                "content_type", "application/octet-stream"
            ),
            upload_date=str(grid_out.upload_date),  # Or format as desired
            length=grid_out.length,
            message=f"File '{grid_out.filename}' uploaded successfully with ID {file_id}",
        )
    except Exception as e:
        print(f"Error uploading file to GridFS: {e}")
        raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")


async def get_gridfs_file(file_id: PydanticObjectId):
    """Retrieves a file from GridFS by its ID."""
    try:
        # Convert PydanticObjectId back to ObjectId for GridFS query
        grid_fs_file_id = ObjectId(str(file_id))
        grid_out = await grid_fs.open_download_stream(grid_fs_file_id)
        return grid_out
    except Exception as e:
        print(f"Error retrieving file {file_id} from GridFS: {e}")

        raise HTTPException(
            status_code=404, detail=f"File not found or error retrieving: {e}"
        )


async def delete_gridfs_file(file_id: PydanticObjectId, owner_id: PydanticObjectId):
    """Deletes a file from GridFS by its ID, ensuring ownership."""
    try:
        grid_fs_file_id = ObjectId(str(file_id))
        file_info = await grid_fs.find_one({"_id": grid_fs_file_id})
        if not file_info:
            raise HTTPException(
                status_code=404, detail=f"File with ID {file_id} not found."
            )

        if file_info.metadata and file_info.metadata.get("owner_id") != str(owner_id):
            raise HTTPException(
                status_code=403, detail="Not authorized to delete this file."
            )

        await grid_fs.delete(grid_fs_file_id)
        return {"message": f"File with ID {file_id} deleted successfully."}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error deleting file {file_id} from GridFS: {e}")
        raise HTTPException(status_code=500, detail=f"Could not delete file: {e}")


async def create_item(
    item_data: ItemCreate,
    owner_id: PydanticObjectId,
    image_ids: Optional[List[PydanticObjectId]] = None,
):
    """Insert an item into the database, optionally linking image IDs."""
    try:
        new_item_dict = item_data.model_dump()
        new_item_dict["owner_id"] = owner_id
        if image_ids:
            new_item_dict["image_ids"] = image_ids
        else:
            new_item_dict["image_ids"] = []

        new_item = ItemModel(**new_item_dict)
        await new_item.insert()
        return f"Item {new_item.id} created successfully."
    except Exception as e:
        print(f"Error creating item: {e}")
        return "Error creating item."


async def get_item(item_id: str):
    """Retrieve an item by ID."""
    try:
        item = await ItemModel.get(PydanticObjectId(item_id))
        if not item:
            raise HTTPException(status_code=404, detail="Item not found.")

        owner = await UserModel.get(item.owner_id)
        owner_email = owner.email if owner else None

        return {
            "id": str(item.id),
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "quantity": item.quantity,
            "owner_email": owner_email,
            "owner_id": str(item.owner_id),
            "image_ids": item.image_ids,
        }

    except Exception as e:
        print(f"Error retrieving item with ID {item_id}: {e}")
        return None


async def get_all_items():
    """Retrieve all items in the database."""
    return await ItemModel.find_all().to_list()


async def update_item(
    item_id: str, item_data: Dict[str, Any], owner_id: PydanticObjectId
):
    """Update an item by ID. item_data should be a dict.
    Can also update image_ids.
    """
    item = await ItemModel.get(PydanticObjectId(item_id))
    if not item:
        return {"modified": False, "message": "Item not found."}
    if item.owner_id != owner_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this item."
        )

    # Ensure image_ids if present is a list of PydanticObjectId
    if "image_ids" in item_data and item_data["image_ids"] is not None:
        try:
            item_data["image_ids"] = [
                PydanticObjectId(img_id) for img_id in item_data["image_ids"]
            ]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid format for image_ids.")

    await item.set(item_data)
    return {"modified": True, "item": await ItemModel.get(PydanticObjectId(item_id))}


async def delete_item(item_id: str, owner_id: PydanticObjectId):
    """Delete an item by ID, ensuring ownership."""
    item = await ItemModel.get(PydanticObjectId(item_id))
    if not item:
        return {"deleted": False, "message": "Item not found."}
    if item.owner_id != owner_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this item."
        )

    if item.image_ids:
        for img_id in item.image_ids:
            try:

                await delete_gridfs_file(img_id, owner_id)
                print(f"Associated file {img_id} deleted from GridFS.")
            except HTTPException as e:

                print(f"Could not delete associated file {img_id}: {e.detail}")
            except Exception as e:
                print(
                    f"An unexpected error occurred while deleting associated file {img_id}: {e}"
                )

    await item.delete()
    return {"deleted": True, "message": f"Item {item_id} and associated files deleted."}


async def associate_image_with_item(
    item_id: str, image_id: PydanticObjectId, owner_id: PydanticObjectId
):
    """Associates an uploaded image (GridFS file ID) with an item."""
    item = await ItemModel.get(PydanticObjectId(item_id))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != owner_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this item."
        )

    if image_id not in item.image_ids:
        item.image_ids.append(image_id)
        await item.save()
    return {
        "message": f"Image {image_id} associated with item {item_id}.",
        "item": item,
    }


async def disassociate_image_from_item(
    item_id: str, image_id: PydanticObjectId, owner_id: PydanticObjectId
):
    """Disassociates an image from an item. Does not delete the file from GridFS."""
    item = await ItemModel.get(PydanticObjectId(item_id))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.owner_id != owner_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to modify this item."
        )

    if image_id in item.image_ids:
        item.image_ids.remove(image_id)
        await item.save()
        return {
            "message": f"Image {image_id} disassociated from item {item_id}.",
            "item": item,
        }
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Image {image_id} not associated with item {item_id}.",
        )
