from datetime import date
from typing import List

from pydantic import BaseModel


class KPIResponse(BaseModel):
    total_active_lots: int
    total_members: int
    pending_negotiations: int
    total_revenue: float
    wow_change_active_lots: float
    wow_change_revenue: float


class PriceHeatmapPoint(BaseModel):
    date: date
    market: str
    price: float


class PriceHeatmapResponse(BaseModel):
    points: List[PriceHeatmapPoint]


class TimelinePoint(BaseModel):
    date: date
    available: int
    in_negotiation: int
    sold: int


class TimelineResponse(BaseModel):
    points: List[TimelinePoint]

