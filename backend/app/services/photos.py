from io import BytesIO
from pathlib import Path
from typing import List

from fastapi import UploadFile
from PIL import Image

from app.core.config import settings


MEDIA_ROOT = Path(settings.media_root)
PHOTOS_ROOT = MEDIA_ROOT / "photos"
THUMBS_ROOT = MEDIA_ROOT / "thumbnails"


def ensure_dirs() -> None:
    PHOTOS_ROOT.mkdir(parents=True, exist_ok=True)
    THUMBS_ROOT.mkdir(parents=True, exist_ok=True)


def _save_image_variant(
    image: Image.Image, dest: Path, max_width: int, quality: int
) -> None:
    w, h = image.size
    if w > max_width:
        new_height = int(h * (max_width / w))
        image = image.resize((max_width, new_height), Image.LANCZOS)
    image.save(dest, optimize=True, quality=quality)


async def process_photos(lot_id: str, files: List[UploadFile]) -> list[str]:
    """
    Resize to <=1200px width, compress, and create 300px thumbnails.
    Returns list of photo paths (relative to MEDIA_ROOT).
    """
    ensure_dirs()
    if not (1 <= len(files) <= 5):
        raise ValueError("Must upload between 1 and 5 photos.")

    photo_urls: list[str] = []

    for idx, file in enumerate(files, start=1):
        suffix = Path(file.filename or "").suffix.lower() or ".jpg"
        base_name = f"{lot_id}-{idx:02d}{suffix}"
        full_path = PHOTOS_ROOT / base_name
        thumb_path = THUMBS_ROOT / base_name

        raw_bytes = await file.read()
        if len(raw_bytes) > 5 * 1024 * 1024:
            raise ValueError("Each photo must be <= 5MB.")
        image = Image.open(BytesIO(raw_bytes)).convert("RGB")

        _save_image_variant(image, full_path, max_width=1200, quality=80)
        _save_image_variant(image, thumb_path, max_width=300, quality=75)

        photo_urls.append(f"photos/{base_name}")

    return photo_urls

