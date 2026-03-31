from typing import Any, Dict, List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.core import TraceabilityEvent


class TraceabilityLedger:
    def __init__(self, db: Session) -> None:
        self.db = db

    def append_event(
        self,
        lot_id: str,
        event_type: str,
        actor: str,
        location: str | None = None,
        gps_lat: float | None = None,
        gps_lon: float | None = None,
        metadata: Dict[str, Any] | None = None,
    ) -> TraceabilityEvent:
        max_event_number = (
            self.db.query(func.max(TraceabilityEvent.event_number))
            .filter(TraceabilityEvent.lot_id == lot_id)
            .scalar()
        )
        next_number = (max_event_number or 0) + 1

        event = TraceabilityEvent(
            lot_id=lot_id,
            event_number=next_number,
            event_type=event_type,
            actor=actor,
            location=location,
            gps_lat=gps_lat,
            gps_lon=gps_lon,
            event_metadata=metadata or {},
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_timeline(self, lot_id: str) -> List[TraceabilityEvent]:
        return (
            self.db.query(TraceabilityEvent)
            .filter(TraceabilityEvent.lot_id == lot_id)
            .order_by(TraceabilityEvent.event_number.asc())
            .all()
        )

    def verify_integrity(self, lot_id: str) -> bool:
        """
        Basic integrity check:
        - event_numbers are strictly sequential starting from 1
        - timestamps are non-decreasing.
        """
        events = self.get_timeline(lot_id)
        if not events:
            return True
        expected_number = 1
        last_ts = None
        for ev in events:
            if ev.event_number != expected_number:
                return False
            if last_ts and ev.timestamp < last_ts:
                return False
            expected_number += 1
            last_ts = ev.timestamp
        return True


