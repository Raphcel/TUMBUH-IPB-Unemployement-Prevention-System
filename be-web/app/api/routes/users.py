import os
import time

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.domain.models.user import User
from app.services.user_service import UserService
from app.schemas.user import UserUpdate, UserResponse
from app.api.dependencies import get_current_user, get_user_service

router = APIRouter(prefix="/users", tags=["Users"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
AVATAR_DIR = os.path.join(UPLOAD_DIR, "avatars")
CV_DIR = os.path.join(UPLOAD_DIR, "cvs")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2MB
MAX_CV_SIZE = 5 * 1024 * 1024  # 5MB


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get the authenticated user's profile."""
    return user_service.get_profile(current_user.id)


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Update the authenticated user's profile."""
    return user_service.update_profile(current_user.id, data)


@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Upload an avatar image for the current user."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="File must be an image (jpg, png, gif, webp)")

    contents = file.file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be smaller than 2MB")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{current_user.id}_{int(time.time())}.{ext}"
    os.makedirs(AVATAR_DIR, exist_ok=True)
    filepath = os.path.join(AVATAR_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    url = f"/uploads/avatars/{filename}"
    user_service.update_profile(current_user.id, UserUpdate(avatar=url))

    return {"url": url}


@router.post("/me/cv")
def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Upload a CV (PDF) for the current user."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="File must be a PDF")

    contents = file.file.read()
    if len(contents) > MAX_CV_SIZE:
        raise HTTPException(status_code=400, detail="CV must be smaller than 5MB")

    filename = f"{current_user.id}_{int(time.time())}.pdf"
    os.makedirs(CV_DIR, exist_ok=True)
    filepath = os.path.join(CV_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    url = f"/uploads/cvs/{filename}"
    user_service.update_profile(current_user.id, UserUpdate(cv_url=url))

    return {"url": url}


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    _: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get a user's profile by ID (authenticated only)."""
    return user_service.get_profile(user_id)
