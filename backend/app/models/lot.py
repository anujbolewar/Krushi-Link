from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, Index, String

from app.core.database import Base


class Lot(Base):
    __tablename__ = "lots"
    __table_args__ = (
        Index("idx_lots_crop_status_fpo", "crop_type", "status", "fpo_id"),
        Index("idx_lots_status_created", "status", "created_at"),
    )

    lot_id = Column(String(50), primary_key=True, index=True)
    fpo_id = Column(String(50), index=True, nullable=False)
    crop_type = Column(String(100), index=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False, default="kg")
    harvest_date = Column(Date, nullable=False)
    location = Column(String(200), nullable=False)
    grade = Column(String(1), nullable=False)  # A, B, C
    grade_method = Column(String(20), nullable=False, default="manual")
    grade_confidence = Column(Float, nullable=True)
    language = Column(String(5), nullable=False, default="en")  # en, hi, mr
    status = Column(String(32), nullable=False, default="available")
    min_price = Column(Float, nullable=True)
    photos = Column(String, nullable=True)  # comma-separated URLs for MVP
    qr_code_url = Column(String, nullable=True)
    export_ready_markets = Column(String, nullable=True)  # CSV of markets
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

