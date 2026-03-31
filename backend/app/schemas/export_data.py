from datetime import date
from typing import Optional

from pydantic import BaseModel


class LotsExportRequest(BaseModel):
    from_date: Optional[date] = None
    to_date: Optional[date] = None


class TransactionsExportRequest(BaseModel):
    from_date: Optional[date] = None
    to_date: Optional[date] = None


class AnalyticsExportRequest(BaseModel):
    from_date: Optional[date] = None
    to_date: Optional[date] = None

