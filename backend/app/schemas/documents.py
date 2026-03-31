from typing import Dict

from pydantic import BaseModel


class BuyerInfo(BaseModel):
    name: str
    country: str


class DocumentGenerateRequest(BaseModel):
    lot_id: str
    buyer: BuyerInfo
    price: float


class DocumentGenerateResponse(BaseModel):
    # Map of filename to URL or description; for MVP we stream PDFs directly,
    # but this schema can be used if we later store metadata.
    files: Dict[str, str]

