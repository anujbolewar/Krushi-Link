from io import BytesIO
from pathlib import Path

import qrcode

from app.core.config import settings


MEDIA_ROOT = Path(settings.media_root)
QRCODES_ROOT = MEDIA_ROOT / "qrcodes"


def ensure_qr_dir() -> None:
    QRCODES_ROOT.mkdir(parents=True, exist_ok=True)


def generate_qr_code(lot_id: str) -> str:
    """
    Generate a QR code PNG for the given lot_id.
    Returns the relative path (under MEDIA_ROOT).
    """
    ensure_qr_dir()
    data = f"https://agrovault.app/verify/{lot_id}"
    img = qrcode.make(data)
    dest = QRCODES_ROOT / f"{lot_id}.png"
    img.save(dest)
    return f"qrcodes/{lot_id}.png"

