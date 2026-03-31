from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class LotBase(BaseModel):
    fpo_id: str = Field(..., description="FPO identifier")
    crop_type: str
    quantity: float
    unit: str = "kg"
    harvest_date: date
    location: str
    grade: str = Field(..., pattern="^[ABC]$")
    language: str = Field(
        "en",
        pattern="^(en|hi|mr)$",
        description="Interface language for this lot (en, hi, mr)",
    )
    min_price: Optional[float] = None


class LotCreate(LotBase):
    pass


class LotUpdate(BaseModel):
    status: Optional[str] = Field(
        None, description="Lot status (available, in_negotiation, sold)"
    )
    min_price: Optional[float] = Field(
        None, description="Minimum acceptable price for negotiations"
    )


class LotRead(LotBase):
    lot_id: str
    status: str
    photos: List[str] = []
    qr_code_url: str | None = None
    export_ready_markets: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

