import csv
import io
import zipfile
from datetime import datetime
from typing import List, Tuple

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.lot import Lot
from app.schemas.lot import LotCreate
from app.services.qr_codes import generate_qr_code


def _parse_row(row: dict, fpo_id: str) -> LotCreate:
    required_fields = ["crop_type", "quantity", "harvest_date", "location"]
    for field in required_fields:
        if not row.get(field):
            raise ValueError(f"Missing required field: {field}")
    return LotCreate(
        fpo_id=fpo_id,
        crop_type=row["crop_type"],
        quantity=float(row["quantity"]),
        unit=row.get("unit", "kg"),
        harvest_date=row["harvest_date"],
        location=row["location"],
        grade=row.get("grade", "B"),
        min_price=float(row["min_price"]) if row.get("min_price") else None,
        language=row.get("language", "en"),
    )


def _generate_lot_id(db: Session, crop_type: str, harvest_date_str: str) -> str:
    crop_prefix = crop_type.upper().split()[0][:6]
    dt = datetime.fromisoformat(harvest_date_str).date()
    date_str = dt.strftime("%Y%m%d")
    like_prefix = f"{crop_prefix}-{date_str}-"
    latest = (
        db.query(Lot)
        .filter(Lot.lot_id.like(f"{like_prefix}%"))
        .order_by(Lot.lot_id.desc())
        .first()
    )
    if latest and latest.lot_id.rsplit("-", 1)[-1].isdigit():
        counter = int(latest.lot_id.rsplit("-", 1)[-1]) + 1
    else:
        counter = 1
    return f"{crop_prefix}-{date_str}-{counter:04d}"


async def create_lots_bulk(
    fpo_id: str,
    csv_file: UploadFile,
    db: Session,
) -> Tuple[int, bytes]:
    """
    Validate all rows and create lots in a single transaction.
    Returns (created_count, zip_bytes_with_qr_codes).
    """
    content = (await csv_file.read()).decode("utf-8")
    reader = csv.DictReader(io.StringIO(content))

    rows: List[LotCreate] = []
    for raw in reader:
        rows.append(_parse_row(raw, fpo_id))

    qr_files: List[Tuple[str, str]] = []
    created = 0
    for data in rows:
        lot_id = _generate_lot_id(db, data.crop_type, str(data.harvest_date))
        qr_rel_path = generate_qr_code(lot_id)

        db_lot = Lot(
            lot_id=lot_id,
            fpo_id=fpo_id,
            crop_type=data.crop_type,
            quantity=data.quantity,
            unit=data.unit,
            harvest_date=data.harvest_date,
            location=data.location,
            grade=data.grade,
            language=data.language,
            status="available",
            qr_code_url=qr_rel_path,
        )
        db.add(db_lot)
        qr_files.append((lot_id, qr_rel_path))
        created += 1

    db.commit()

    # Package QR codes into a ZIP in-memory
    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for lot_id, rel_path in qr_files:
            qr_path = (generate_qr_code.__globals__["QRCODES_ROOT"] / f"{lot_id}.png")
            if qr_path.exists():
                zf.write(qr_path, arcname=f"{lot_id}.png")
    mem_zip.seek(0)
    return created, mem_zip.read()


