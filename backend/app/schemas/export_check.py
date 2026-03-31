from datetime import datetime
from typing import Dict, List

from pydantic import BaseModel, Field


class ExportCheckRequest(BaseModel):
    lot_id: str
    target_markets: List[str] = Field(
        ..., description="List of markets e.g. ['UAE','EU','US']"
    )
    pesticide_residues: Dict[str, float] = Field(
        default_factory=dict, description="Map of pesticide name -> residue level"
    )


class ComplianceCheck(BaseModel):
    check_type: str
    passed: bool
    details: str


class MarketValidation(BaseModel):
    market: str
    passed: bool
    checks: List[ComplianceCheck]
    remediation_steps: List[str]


class ExportReadinessReport(BaseModel):
    lot_id: str
    checked_at: datetime
    results: List[MarketValidation]

