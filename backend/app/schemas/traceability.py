from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TraceabilityEventCreate(BaseModel):
    lot_id: str
    event_type: str
    actor: str
    location: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TraceabilityEventRead(BaseModel):
    id: int
    lot_id: str
    event_number: int
    event_type: str
    timestamp: datetime
    actor: str
    location: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lon: Optional[float] = None
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        validation_alias="event_metadata",
        serialization_alias="metadata",
    )

    class Config:
        from_attributes = True


class ColdChainSnapshot(BaseModel):
    entry_timestamp: Optional[datetime]
    entry_temperature: Optional[float]
    expected_shelf_life_days: Optional[int]
    exit_timestamp: Optional[datetime]
    exit_temperature: Optional[float]


class VerifyLotResponse(BaseModel):
    lot_id: str
    crop_type: str
    grade: str
    quantity: float
    unit: str
    harvest_date: date
    fpo_name: str
    status: str
    traceability_timeline: List[TraceabilityEventRead]
    cold_chain: Optional[ColdChainSnapshot] = None

