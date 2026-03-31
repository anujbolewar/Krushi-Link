from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    event,
)

from app.core.database import Base


class FPO(Base):
    __tablename__ = "fpos"

    fpo_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    registration_number = Column(String(100), nullable=False)
    fssai_license = Column(String(100), nullable=False)
    apeda_rcmc = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    member_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False)  # fpo_manager, buyer, admin
    fpo_id = Column(String(50), nullable=True, index=True)
    language_preference = Column(String(5), default="en", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)


class Bid(Base):
    __tablename__ = "bids"

    bid_id = Column(String(50), primary_key=True, index=True)
    lot_id = Column(String(50), index=True, nullable=False)
    buyer_id = Column(String(50), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    delivery_terms = Column(Text, nullable=True)
    status = Column(String(32), default="pending", nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
    negotiation_history = Column(JSON, nullable=True)


class TraceabilityEvent(Base):
    __tablename__ = "traceability_events"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(String(50), index=True, nullable=False)
    event_number = Column(Integer, nullable=False)
    event_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    actor = Column(String(100), nullable=False)
    location = Column(String(200), nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_lon = Column(Float, nullable=True)
    event_metadata = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


@event.listens_for(TraceabilityEvent, "before_update", propagate=True)
def _prevent_traceability_update(mapper, connection, target) -> None:  # type: ignore[override]
    raise RuntimeError("Traceability events are append-only and cannot be updated.")


@event.listens_for(TraceabilityEvent, "before_delete", propagate=True)
def _prevent_traceability_delete(mapper, connection, target) -> None:  # type: ignore[override]
    raise RuntimeError("Traceability events are append-only and cannot be deleted.")


class ColdChainRecord(Base):
    __tablename__ = "cold_chain_records"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(String(50), index=True, nullable=False)
    entry_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    entry_temperature = Column(Float, nullable=False)
    expected_shelf_life_days = Column(Integer, nullable=False)
    exit_timestamp = Column(DateTime, nullable=True)
    exit_temperature = Column(Float, nullable=True)


class TemperatureReading(Base):
    __tablename__ = "temperature_readings"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    temperature = Column(Float, nullable=False)
    recorded_by = Column(String(50), nullable=False)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), index=True, nullable=False)
    notification_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(300), nullable=True)
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read_at = Column(DateTime, nullable=True)


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    commodity = Column(String(100), nullable=False, index=True)
    market = Column(String(100), nullable=True)
    exchange = Column(String(50), nullable=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=True)
    volume = Column(Float, nullable=True)
    source = Column(String(50), nullable=False)  # ncdex, apmc


class ExportStandard(Base):
    __tablename__ = "export_standards"

    id = Column(Integer, primary_key=True, index=True)
    crop_type = Column(String(100), nullable=False, index=True)
    pesticide = Column(String(100), nullable=False)
    market = Column(String(50), nullable=False)  # UAE, EU, US
    grade = Column(String(1), nullable=False)  # A, B, C
    mrl_limit = Column(Float, nullable=False)

