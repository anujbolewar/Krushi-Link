from pathlib import Path
import logging
from datetime import datetime

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional, Dict

from app.core.database import Base, engine, get_db
from app.models.core import Bid, ColdChainRecord, FPO, User
from app.models.lot import Lot
from app.schemas.analytics import (
    KPIResponse,
    PriceHeatmapResponse,
    TimelineResponse,
)
from app.schemas.auth import LoginRequest, TokenResponse, UserMeResponse
from app.schemas.bid import BidCreate, BidRead, BidUpdate
from app.schemas.cold_chain import (
    ColdChainAlertsResponse,
    ColdChainEntryRequest,
    ColdChainExitRequest,
    ColdChainRecordRead,
    ColdChainTemperatureRequest,
)
from app.schemas.documents import DocumentGenerateRequest
from app.schemas.export_check import (
    ExportCheckRequest,
    ExportReadinessReport as ExportReadinessReportSchema,
)
from app.schemas.forecast import PriceForecast, SellRecommendation
from app.schemas.export_data import (
    AnalyticsExportRequest,
    LotsExportRequest,
    TransactionsExportRequest,
)
from app.schemas.lot import LotCreate, LotRead, LotUpdate
from app.schemas.traceability import (
    TraceabilityEventCreate,
    TraceabilityEventRead,
    VerifyLotResponse,
    ColdChainSnapshot,
)
from app.services.bulk_lots import create_lots_bulk
from app.services.cold_chain import ColdChainTracker
from app.services.documents import DocumentGenerator
from app.services.export_readiness import ExportReadinessChecker
from app.services.photos import process_photos
from app.services.price_forecaster import PriceForecaster
from app.services.qr_codes import generate_qr_code
from app.services.traceability import TraceabilityLedger


BASE_DIR = Path(__file__).resolve().parent.parent.parent
TEMPLATES_DIR = BASE_DIR / "frontend" / "templates"
STATIC_DIR = BASE_DIR / "frontend" / "static"


app = FastAPI(title="AgroVault Web MVP", default_response_class=HTMLResponse)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


# Create tables for early local development.
Base.metadata.create_all(bind=engine)


@app.get("/home", response_class=HTMLResponse)
async def home_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/", response_class=HTMLResponse)
async def dashboard_root(request: Request) -> HTMLResponse:
    # TODO: Replace mocked metrics with real DB queries
    kpis = {
        "total_active_lots": 12,
        "total_members": 180,
        "pending_negotiations": 4,
        "total_revenue": 12_50_000,
    }
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "kpis": kpis,
        },
    )

@app.get("/members", response_class=HTMLResponse)
async def members_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "members.html",
        {"request": request,}
    )

@app.get("/documents", response_class=HTMLResponse)
async def documents_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "documents.html",
        {"request": request,}
    )

@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "settings.html",
        {"request": request,}
    )

@app.get("/negotiations", response_class=HTMLResponse)
async def negotiations_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "negotiations.html",
        {
            "request": request,
        },
    )

@app.get("/lots", response_class=HTMLResponse)
async def lots_page(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        "lots.html",
        {
            "request": request,
        },
    )


@app.get("/health", response_class=HTMLResponse)
async def health() -> HTMLResponse:
    return HTMLResponse("OK", media_type="text/plain")


@app.post("/api/v1/lots", response_model=LotRead, response_class=JSONResponse)
def create_lot(payload: LotCreate, db: Session = Depends(get_db)) -> LotRead:
    # Very small Lot_ID generator for MVP: CROP-YYYYMMDD-XXXX (local only)
    crop_prefix = payload.crop_type.upper().split()[0][:6]
    date_str = payload.harvest_date.strftime("%Y%m%d")
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

    lot_id = f"{crop_prefix}-{date_str}-{counter:04d}"

    qr_path = generate_qr_code(lot_id)

    db_lot = Lot(
        lot_id=lot_id,
        fpo_id=payload.fpo_id,
        crop_type=payload.crop_type,
        quantity=payload.quantity,
        unit=payload.unit,
        harvest_date=payload.harvest_date,
        location=payload.location,
        grade=payload.grade,
        language=payload.language,
        status="available",
        qr_code_url=qr_path,
    )
    db.add(db_lot)
    db.commit()
    db.refresh(db_lot)
    return LotRead.from_orm(db_lot)


@app.get("/api/v1/lots", response_model=list[LotRead], response_class=JSONResponse)
def list_lots(
    crop_type: str | None = None,
    status: str | None = None,
    fpo_id: str | None = None,
    grade: str | None = None,
    location: str | None = None,
    db: Session = Depends(get_db),
) -> list[LotRead]:
    query = db.query(Lot)
    if crop_type:
        query = query.filter(Lot.crop_type == crop_type)
    if status:
        query = query.filter(Lot.status == status)
    if fpo_id:
        query = query.filter(Lot.fpo_id == fpo_id)
    if grade:
        query = query.filter(Lot.grade == grade)
    if location:
        query = query.filter(Lot.location == location)
    lots = query.order_by(Lot.created_at.desc()).limit(100).all()
    return [LotRead.from_orm(l) for l in lots]


@app.get(
    "/api/v1/lots/{lot_id}",
    response_model=LotRead,
    response_class=JSONResponse,
)
def get_lot(lot_id: str, db: Session = Depends(get_db)) -> LotRead:
    lot = db.query(Lot).filter(Lot.lot_id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return LotRead.from_orm(lot)


@app.patch(
    "/api/v1/lots/{lot_id}",
    response_model=LotRead,
    response_class=JSONResponse,
)
def update_lot(
    lot_id: str,
    payload: LotUpdate,
    db: Session = Depends(get_db),
) -> LotRead:
    lot = db.query(Lot).filter(Lot.lot_id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if payload.status is not None:
        lot.status = payload.status
    if payload.min_price is not None:
        lot.min_price = payload.min_price
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return LotRead.from_orm(lot)


@app.post(
    "/api/v1/lots/bulk",
    response_class=StreamingResponse,
)
async def bulk_create_lots(
    fpo_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    created, zip_bytes = await create_lots_bulk(fpo_id, file, db)
    if created == 0:
        raise HTTPException(status_code=400, detail="No valid rows in CSV.")
    return StreamingResponse(
        iter([zip_bytes]),
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="lot_qr_codes.zip"',
            "X-Created-Lots": str(created),
        },
    )


# 9.2 - Price forecasting endpoints


@app.get(
    "/api/v1/forecast/{crop_type}",
    response_model=PriceForecast,
    response_class=JSONResponse,
)
def get_price_forecast(
    crop_type: str,
    db: Session = Depends(get_db),
) -> PriceForecast:
    forecaster = PriceForecaster(db)
    try:
        data = forecaster.forecast_price(crop_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return PriceForecast(
        crop_type=data["crop_type"],
        forecast_date=data["forecast_date"],
        predictions=data["predictions"],
        optimal_sell_window=data["optimal_sell_window"],
        data_sources=data["data_sources"],
    )


@app.get(
    "/api/v1/forecast/{crop_type}/recommend",
    response_model=SellRecommendation,
    response_class=JSONResponse,
)
def get_sell_recommendation(
    crop_type: str,
    db: Session = Depends(get_db),
) -> SellRecommendation:
    forecaster = PriceForecaster(db)
    try:
        data = forecaster.recommend_sell_window(crop_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return SellRecommendation(
        crop_type=data["crop_type"],
        optimal_sell_window=data["optimal_sell_window"],
        predictions=data["predictions"],
    )


# 9.3 - Export readiness endpoints


@app.post(
    "/api/v1/export-check",
    response_model=ExportReadinessReportSchema,
    response_class=JSONResponse,
)
def check_export_readiness(
    payload: ExportCheckRequest,
    db: Session = Depends(get_db),
) -> ExportReadinessReportSchema:
    checker = ExportReadinessChecker(db)
    try:
        report = checker.check_readiness(
            lot_id=payload.lot_id,
            target_markets=payload.target_markets,
            pesticide_residues=payload.pesticide_residues,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ExportReadinessReportSchema(
        lot_id=report["lot_id"],
        checked_at=report["checked_at"],
        results=report["results"],
    )


@app.get(
    "/api/v1/export-check/{lot_id}",
    response_model=ExportReadinessReportSchema,
    response_class=JSONResponse,
)
def get_export_readiness(
    lot_id: str,
    db: Session = Depends(get_db),
) -> ExportReadinessReportSchema:
    # For MVP we recompute with empty residues and default markets.
    checker = ExportReadinessChecker(db)
    try:
        report = checker.check_readiness(
            lot_id=lot_id,
            target_markets=["UAE", "EU", "US"],
            pesticide_residues={},
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ExportReadinessReportSchema(
        lot_id=report["lot_id"],
        checked_at=report["checked_at"],
        results=report["results"],
    )


# 9.4 - Traceability endpoints


@app.get(
    "/api/v1/traceability/{lot_id}",
    response_model=list[TraceabilityEventRead],
    response_class=JSONResponse,
)
def get_traceability_timeline(
    lot_id: str,
    db: Session = Depends(get_db),
) -> list[TraceabilityEventRead]:
    ledger = TraceabilityLedger(db)
    events = ledger.get_timeline(lot_id)
    return [TraceabilityEventRead.from_orm(ev) for ev in events]


@app.post(
    "/api/v1/traceability/event",
    response_model=TraceabilityEventRead,
    response_class=JSONResponse,
)
def append_traceability_event(
    payload: TraceabilityEventCreate,
    db: Session = Depends(get_db),
) -> TraceabilityEventRead:
    ledger = TraceabilityLedger(db)
    event = ledger.append_event(
        lot_id=payload.lot_id,
        event_type=payload.event_type,
        actor=payload.actor,
        location=payload.location,
        gps_lat=payload.gps_lat,
        gps_lon=payload.gps_lon,
        metadata=payload.metadata,
    )
    return TraceabilityEventRead.from_orm(event)


@app.get(
    "/api/v1/verify/{lot_id}",
    response_model=VerifyLotResponse,
    response_class=JSONResponse,
)
def verify_lot(
    lot_id: str,
    db: Session = Depends(get_db),
) -> VerifyLotResponse:
    lot = db.query(Lot).filter(Lot.lot_id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Invalid or unrecognized code")

    fpo = db.query(FPO).filter(FPO.fpo_id == lot.fpo_id).first()
    fpo_name = fpo.name if fpo else lot.fpo_id

    ledger = TraceabilityLedger(db)
    events = ledger.get_timeline(lot_id)

    cold = (
        db.query(ColdChainRecord)
        .filter(ColdChainRecord.lot_id == lot_id)
        .order_by(ColdChainRecord.entry_timestamp.desc())
        .first()
    )
    cold_snapshot = (
        ColdChainSnapshot(
            entry_timestamp=cold.entry_timestamp,
            entry_temperature=cold.entry_temperature,
            expected_shelf_life_days=cold.expected_shelf_life_days,
            exit_timestamp=cold.exit_timestamp,
            exit_temperature=cold.exit_temperature,
        )
        if cold
        else None
    )

    return VerifyLotResponse(
        lot_id=lot.lot_id,
        crop_type=lot.crop_type,
        grade=lot.grade,
        quantity=lot.quantity,
        unit=lot.unit,
        harvest_date=lot.harvest_date,
        fpo_name=fpo_name,
        status=lot.status,
        traceability_timeline=[TraceabilityEventRead.from_orm(e) for e in events],
        cold_chain=cold_snapshot,
    )


# 9.5 - Cold chain endpoints


@app.post(
    "/api/v1/cold-chain/entry",
    response_model=ColdChainRecordRead,
    response_class=JSONResponse,
)
def cold_chain_entry(
    payload: ColdChainEntryRequest,
    db: Session = Depends(get_db),
) -> ColdChainRecordRead:
    tracker = ColdChainTracker(db)
    record = tracker.record_entry(
        lot_id=payload.lot_id,
        temperature=payload.temperature,
        expected_shelf_life_days=payload.expected_shelf_life_days,
    )
    return ColdChainRecordRead(
        lot_id=record.lot_id,
        entry_timestamp=record.entry_timestamp,
        entry_temperature=record.entry_temperature,
        expected_shelf_life_days=record.expected_shelf_life_days,
        exit_timestamp=record.exit_timestamp,
        exit_temperature=record.exit_temperature,
    )


@app.post(
    "/api/v1/cold-chain/temperature",
    response_model=ColdChainAlertsResponse,
    response_class=JSONResponse,
)
def cold_chain_temperature(
    payload: ColdChainTemperatureRequest,
    db: Session = Depends(get_db),
) -> ColdChainAlertsResponse:
    tracker = ColdChainTracker(db)
    tracker.record_temperature(
        lot_id=payload.lot_id,
        temperature=payload.temperature,
        recorded_by=payload.recorded_by,
    )
    # For alerts we need crop_type; fetch from lot
    lot = db.query(Lot).filter(Lot.lot_id == payload.lot_id).first()
    crop_type = lot.crop_type if lot else "mango"
    alerts = tracker.check_alerts(payload.lot_id, crop_type)
    remaining = tracker.calculate_remaining_shelf_life(payload.lot_id)
    return ColdChainAlertsResponse(alerts=alerts, remaining_shelf_life_percent=remaining)


@app.post(
    "/api/v1/cold-chain/exit",
    response_model=ColdChainRecordRead,
    response_class=JSONResponse,
)
def cold_chain_exit(
    payload: ColdChainExitRequest,
    db: Session = Depends(get_db),
) -> ColdChainRecordRead:
    tracker = ColdChainTracker(db)
    try:
        record = tracker.record_exit(
            lot_id=payload.lot_id,
            temperature=payload.temperature,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return ColdChainRecordRead(
        lot_id=record.lot_id,
        entry_timestamp=record.entry_timestamp,
        entry_temperature=record.entry_temperature,
        expected_shelf_life_days=record.expected_shelf_life_days,
        exit_timestamp=record.exit_timestamp,
        exit_temperature=record.exit_temperature,
    )


@app.get(
    "/api/v1/cold-chain/{lot_id}",
    response_model=ColdChainRecordRead,
    response_class=JSONResponse,
)
def cold_chain_history(
    lot_id: str,
    db: Session = Depends(get_db),
) -> ColdChainRecordRead:
    record = (
        db.query(ColdChainRecord)
        .filter(ColdChainRecord.lot_id == lot_id)
        .order_by(ColdChainRecord.entry_timestamp.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="No cold chain record found")
    return ColdChainRecordRead(
        lot_id=record.lot_id,
        entry_timestamp=record.entry_timestamp,
        entry_temperature=record.entry_temperature,
        expected_shelf_life_days=record.expected_shelf_life_days,
        exit_timestamp=record.exit_timestamp,
        exit_temperature=record.exit_temperature,
    )


# 9.6 - Document generation endpoints


@app.post(
    "/api/v1/documents/generate",
    response_class=StreamingResponse,
)
def generate_documents(
    payload: DocumentGenerateRequest,
    db: Session = Depends(get_db),
):
    generator = DocumentGenerator(db)
    try:
        docs = generator.generate_all_documents(
            lot_id=payload.lot_id,
            buyer_info=payload.buyer.dict(),
            price=payload.price,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    # For MVP, return a ZIP of PDFs
    import io
    import zipfile

    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for filename, content in docs.items():
            zf.writestr(filename, content)
    mem_zip.seek(0)
    return StreamingResponse(
        iter([mem_zip.read()]),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="documents_{payload.lot_id}.zip"'
        },
    )


# 9.7 - Bidding and negotiation endpoints


@app.post(
    "/api/v1/bids",
    response_model=BidRead,
    response_class=JSONResponse,
)
def create_bid(
    payload: BidCreate,
    db: Session = Depends(get_db),
) -> BidRead:
    bid_id = f"BID-{payload.lot_id}-{payload.buyer_id}-{int(__import__('time').time())}"
    bid = Bid(
        bid_id=bid_id,
        lot_id=payload.lot_id,
        buyer_id=payload.buyer_id,
        amount=payload.amount,
        quantity=payload.quantity,
        delivery_terms=payload.delivery_terms,
        status="pending",
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return BidRead.from_orm(bid)


@app.get(
    "/api/v1/bids",
    response_model=list[BidRead],
    response_class=JSONResponse,
)
def list_bids(
    user_id: str | None = None,
    role: str | None = None,
    db: Session = Depends(get_db),
) -> list[BidRead]:
    query = db.query(Bid)
    if role == "buyer" and user_id:
        query = query.filter(Bid.buyer_id == user_id)
    bids = query.order_by(Bid.submitted_at.desc()).all()
    return [BidRead.from_orm(b) for b in bids]


@app.patch(
    "/api/v1/bids/{bid_id}",
    response_model=BidRead,
    response_class=JSONResponse,
)
def update_bid(
    bid_id: str,
    payload: BidUpdate,
    db: Session = Depends(get_db),
) -> BidRead:
    bid = db.query(Bid).filter(Bid.bid_id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    bid.status = payload.status
    if payload.status in {"countered"} and payload.amount and payload.quantity:
        history = bid.negotiation_history or []
        history.append(
            {
                "amount": payload.amount,
                "quantity": payload.quantity,
                "offered_by": payload.offered_by or "fpo",
                "offered_at": __import__("datetime").datetime.utcnow().isoformat(),
            }
        )
        bid.negotiation_history = history
    bid.responded_at = __import__("datetime").datetime.utcnow()
    db.add(bid)
    db.commit()
    db.refresh(bid)
    return BidRead.from_orm(bid)


# 9.8 - Authentication endpoints (MVP, simple sessionless JWT-like stub)

import secrets


@app.post(
    "/api/v1/auth/login",
    response_model=TokenResponse,
    response_class=JSONResponse,
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # MVP: skip real password check, assume any password works for seeded user
    token = secrets.token_urlsafe(32)
    user.last_login = __import__("datetime").datetime.utcnow()
    db.add(user)
    db.commit()
    return TokenResponse(access_token=token, expires_in=3600)


@app.post(
    "/api/v1/auth/logout",
    response_class=JSONResponse,
)
def logout() -> JSONResponse:
    # MVP: client discards token
    return JSONResponse({"detail": "Logged out"})


@app.get(
    "/api/v1/auth/me",
    response_model=UserMeResponse,
    response_class=JSONResponse,
)
def me(
    email: str,
    db: Session = Depends(get_db),
) -> UserMeResponse:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserMeResponse(
        user_id=user.user_id,
        email=user.email,
        role=user.role,
        fpo_id=user.fpo_id,
        language_preference=user.language_preference,
        last_login=user.last_login,
    )


# 9.9 - Analytics endpoints


@app.get(
    "/api/v1/analytics/kpis",
    response_model=KPIResponse,
    response_class=JSONResponse,
)
def analytics_kpis(db: Session = Depends(get_db)) -> KPIResponse:
    total_active_lots = db.query(Lot).filter(Lot.status == "available").count()
    total_members = db.query(FPO).count() * 10  # MVP heuristic
    pending_negotiations = db.query(Bid).filter(Bid.status == "pending").count()
    total_revenue = 0.0  # MVP: requires transactions table; keep 0
    return KPIResponse(
        total_active_lots=total_active_lots,
        total_members=total_members,
        pending_negotiations=pending_negotiations,
        total_revenue=total_revenue,
        wow_change_active_lots=0.0,
        wow_change_revenue=0.0,
    )


@app.get(
    "/api/v1/analytics/price-heatmap",
    response_model=PriceHeatmapResponse,
    response_class=JSONResponse,
)
def analytics_price_heatmap(db: Session = Depends(get_db)) -> PriceHeatmapResponse:
    from app.models.core import PriceHistory

    rows = (
        db.query(PriceHistory)
        .order_by(PriceHistory.date.desc())
        .limit(100)
        .all()
    )
    points = [
        {
            "date": r.date,
            "market": r.market or r.exchange or r.source,
            "price": r.modal_price or r.max_price or r.min_price or 0.0,
        }
        for r in rows
    ]
    return PriceHeatmapResponse(points=points)


@app.get(
    "/api/v1/analytics/timeline",
    response_model=TimelineResponse,
    response_class=JSONResponse,
)
def analytics_timeline(db: Session = Depends(get_db)) -> TimelineResponse:
    from sqlalchemy import func

    rows = (
        db.query(
            func.date_trunc("day", Lot.created_at).label("day"),
            Lot.status,
            func.count().label("count"),
        )
        .group_by("day", Lot.status)
        .order_by("day")
        .all()
    )
    buckets = {}
    for day, status, count in rows:
        key = day.date()
        bucket = buckets.setdefault(
            key, {"available": 0, "in_negotiation": 0, "sold": 0}
        )
        if status in bucket:
            bucket[status] = count
    points = [
        {
            "date": d,
            "available": v["available"],
            "in_negotiation": v["in_negotiation"],
            "sold": v["sold"],
        }
        for d, v in buckets.items()
    ]
    return TimelineResponse(points=points)


# 9.10 - Data export endpoints


@app.post(
    "/api/v1/export/lots",
    response_class=StreamingResponse,
)
def export_lots(
    payload: LotsExportRequest,
    db: Session = Depends(get_db),
):
    import csv
    import io

    query = db.query(Lot)
    if payload.from_date:
        query = query.filter(Lot.created_at >= payload.from_date)
    if payload.to_date:
        query = query.filter(Lot.created_at <= payload.to_date)
    lots = query.all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "lot_id",
            "crop_type",
            "quantity",
            "unit",
            "harvest_date",
            "location",
            "grade",
            "status",
        ]
    )
    for l in lots:
        writer.writerow(
            [
                l.lot_id,
                l.crop_type,
                l.quantity,
                l.unit,
                l.harvest_date.isoformat(),
                l.location,
                l.grade,
                l.status,
            ]
        )
    data = buffer.getvalue().encode("utf-8")
    return StreamingResponse(
        iter([data]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="lots.csv"'},
    )


@app.post(
    "/api/v1/export/transactions",
    response_class=StreamingResponse,
)
def export_transactions(
    payload: TransactionsExportRequest,
    db: Session = Depends(get_db),
):
    import csv
    import io

    # MVP: derive transactions from accepted bids
    query = db.query(Bid).filter(Bid.status == "accepted")
    bids = query.all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        ["date", "lot_id", "buyer", "quantity", "price", "status"]
    )
    for b in bids:
        writer.writerow(
            [
                (b.responded_at or b.submitted_at).date().isoformat(),
                b.lot_id,
                b.buyer_id,
                b.quantity,
                b.amount,
                b.status,
            ]
        )
    data = buffer.getvalue().encode("utf-8")
    return StreamingResponse(
        iter([data]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="transactions.csv"'},
    )


@app.post(
    "/api/v1/export/analytics",
    response_class=StreamingResponse,
)
def export_analytics(
    payload: AnalyticsExportRequest,
    db: Session = Depends(get_db),
):
    # MVP: simple PDF with KPIs using DocumentGenerator-like pattern
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    import io as _io

    buffer = _io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "AgroVault Analytics Report")

    kpis = analytics_kpis(db)
    c.setFont("Helvetica", 12)
    y = height - 90
    c.drawString(50, y, f"Total active lots: {kpis.total_active_lots}")
    y -= 20
    c.drawString(50, y, f"Total members: {kpis.total_members}")
    y -= 20
    c.drawString(50, y, f"Pending negotiations: {kpis.pending_negotiations}")
    y -= 20
    c.drawString(50, y, f"Total revenue: {kpis.total_revenue}")

    c.showPage()
    c.save()
    pdf = buffer.getvalue()
    buffer.close()
    return StreamingResponse(
        iter([pdf]),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="analytics.pdf"'},
    )


@app.post(
    "/api/v1/lots/{lot_id}/photos",
    response_model=LotRead,
    response_class=JSONResponse,
)
async def upload_lot_photos(
    lot_id: str,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> LotRead:
    lot = db.query(Lot).filter(Lot.lot_id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    try:
        photo_paths = await process_photos(lot_id, files)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    existing = (lot.photos or "").split(",") if lot.photos else []
    lot.photos = ",".join(existing + photo_paths)
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return LotRead.from_orm(lot)


# WebSocket manager for real-time notifications
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_notification(self, user_id: int, message: str):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/bids/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(user_id)


# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for GZIP compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middleware for trusted hosts
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*", "localhost"])

# Middleware for rate limiting
class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests_per_minute):
        super().__init__(app)
        self.max_requests_per_minute = max_requests_per_minute
        self.requests = {}

    async def dispatch(self, request, call_next):
        client_ip = request.client.host
        now = datetime.now()
        self.requests.setdefault(client_ip, []).append(now)
        self.requests[client_ip] = [
            timestamp for timestamp in self.requests[client_ip]
            if (now - timestamp).seconds < 60
        ]
        if len(self.requests[client_ip]) > self.max_requests_per_minute:
            return JSONResponse(
                {"error": "Too Many Requests"},
                status_code=HTTP_429_TOO_MANY_REQUESTS,
            )
        return await call_next(request)

app.add_middleware(RateLimitMiddleware, max_requests_per_minute=100)

# Middleware for logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "validation_error",
            "message": "Validation failed",
            "details": exc.errors(),
        },
    )


# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Secret key and algorithm for JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

# Pydantic model for token data
class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Dependency for getting the current user
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )
        return TokenData(username=username, role=role)
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

# Role-based access control
async def role_required(required_role: str, token_data: TokenData = Depends(get_current_user)):
    if token_data.role != required_role:
        raise HTTPException(
            status_code=403, detail="You do not have permission to perform this action"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

