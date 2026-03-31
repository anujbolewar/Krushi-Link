from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ColdChainEntryRequest(BaseModel):
    lot_id: str
    temperature: float
    expected_shelf_life_days: int = Field(..., gt=0)


class ColdChainTemperatureRequest(BaseModel):
    lot_id: str
    temperature: float
    recorded_by: str


class ColdChainExitRequest(BaseModel):
    lot_id: str
    temperature: float


class ColdChainRecordRead(BaseModel):
    lot_id: str
    entry_timestamp: datetime
    entry_temperature: float
    expected_shelf_life_days: int
    exit_timestamp: Optional[datetime]
    exit_temperature: Optional[float]


class ColdChainAlertsResponse(BaseModel):
    alerts: List[dict]
    remaining_shelf_life_percent: float

