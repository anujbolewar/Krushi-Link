from datetime import datetime, timedelta
from typing import List, Tuple

from sqlalchemy.orm import Session

from app.models.core import ColdChainRecord, TemperatureReading


SAFE_RANGES = {
    "mango": (12.0, 14.0),
    "pomegranate": (5.0, 7.0),
    "onion": (0.0, 4.0),
    "grape": (0.0, 2.0),
}


class ColdChainTracker:
    def __init__(self, db: Session) -> None:
        self.db = db

    # 6.1 cold storage entry and exit
    def record_entry(
        self,
        lot_id: str,
        temperature: float,
        expected_shelf_life_days: int,
    ) -> ColdChainRecord:
        record = ColdChainRecord(
            lot_id=lot_id,
            entry_temperature=temperature,
            expected_shelf_life_days=expected_shelf_life_days,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def record_exit(self, lot_id: str, temperature: float) -> ColdChainRecord:
        record = (
            self.db.query(ColdChainRecord)
            .filter(ColdChainRecord.lot_id == lot_id)
            .order_by(ColdChainRecord.entry_timestamp.desc())
            .first()
        )
        if not record:
            raise ValueError("No cold chain record found for lot.")
        record.exit_timestamp = datetime.utcnow()
        record.exit_temperature = temperature
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    # 6.2 temperature monitoring and alerts
    def record_temperature(
        self,
        lot_id: str,
        temperature: float,
        recorded_by: str,
    ) -> TemperatureReading:
        reading = TemperatureReading(
            lot_id=lot_id,
            temperature=temperature,
            recorded_by=recorded_by,
        )
        self.db.add(reading)
        self.db.commit()
        self.db.refresh(reading)
        return reading

    def _get_safe_range(self, crop_type: str) -> Tuple[float, float] | None:
        return SAFE_RANGES.get(crop_type.lower())

    def check_alerts(
        self,
        lot_id: str,
        crop_type: str,
    ) -> List[dict]:
        alerts: List[dict] = []
        record = (
            self.db.query(ColdChainRecord)
            .filter(ColdChainRecord.lot_id == lot_id)
            .order_by(ColdChainRecord.entry_timestamp.desc())
            .first()
        )
        if not record:
            return alerts

        # Temperature violation based on latest reading
        latest_reading = (
            self.db.query(TemperatureReading)
            .filter(TemperatureReading.lot_id == lot_id)
            .order_by(TemperatureReading.timestamp.desc())
            .first()
        )
        safe_range = self._get_safe_range(crop_type)
        if latest_reading and safe_range:
            low, high = safe_range
            if not (low <= latest_reading.temperature <= high):
                alerts.append(
                    {
                        "alert_type": "temperature_violation",
                        "severity": "warning",
                        "triggered_at": latest_reading.timestamp.isoformat(),
                        "message": f"Temperature {latest_reading.temperature}°C outside safe range {low}-{high}°C for {crop_type}.",
                    }
                )

        # Shelf life warning
        if record.entry_timestamp:
            now = datetime.utcnow()
            elapsed = now - record.entry_timestamp
            total = timedelta(days=record.expected_shelf_life_days)
            if total.total_seconds() > 0:
                used_ratio = elapsed.total_seconds() / total.total_seconds()
                if used_ratio >= 0.8:
                    alerts.append(
                        {
                            "alert_type": "shelf_life_warning",
                            "severity": "warning",
                            "triggered_at": now.isoformat(),
                            "message": "Storage duration has exceeded 80% of expected shelf life.",
                        }
                    )
        return alerts

    # 6.3 shelf life calculation
    def calculate_remaining_shelf_life(self, lot_id: str) -> float:
        record = (
            self.db.query(ColdChainRecord)
            .filter(ColdChainRecord.lot_id == lot_id)
            .order_by(ColdChainRecord.entry_timestamp.desc())
            .first()
        )
        if not record:
            raise ValueError("No cold chain record found for lot.")
        now = datetime.utcnow()
        total = timedelta(days=record.expected_shelf_life_days)
        elapsed = now - record.entry_timestamp
        remaining = max(total - elapsed, timedelta(0))
        if total.total_seconds() == 0:
            return 0.0
        return round(100.0 * remaining.total_seconds() / total.total_seconds(), 2)

