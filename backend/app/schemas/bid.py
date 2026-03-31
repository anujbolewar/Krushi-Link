from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CounterOffer(BaseModel):
    amount: float
    quantity: float
    offered_by: str  # fpo or buyer
    offered_at: datetime


class BidCreate(BaseModel):
    lot_id: str
    buyer_id: str
    amount: float
    quantity: float
    delivery_terms: Optional[str] = None


class BidUpdate(BaseModel):
    status: str = Field(..., description="accepted, countered, declined")
    amount: Optional[float] = None
    quantity: Optional[float] = None
    offered_by: Optional[str] = None


class BidRead(BaseModel):
    bid_id: str
    lot_id: str
    buyer_id: str
    amount: float
    quantity: float
    delivery_terms: Optional[str]
    status: str
    submitted_at: datetime
    responded_at: Optional[datetime]
    negotiation_history: Optional[List[CounterOffer]]

    class Config:
        from_attributes = True

