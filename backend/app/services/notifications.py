from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

# Notification model (to be implemented in models)
class Notification:
    def __init__(self, user_id: int, type: str, message: str, created_at: datetime, read_at: datetime = None):
        self.user_id = user_id
        self.type = type
        self.message = message
        self.created_at = created_at
        self.read_at = read_at

# Notification Service
class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def send_notification(self, user_id: int, type: str, message: str):
        notification = Notification(
            user_id=user_id,
            type=type,
            message=message,
            created_at=datetime.utcnow()
        )
        self.db.add(notification)
        self.db.commit()
        return notification

    def get_notifications(self, user_id: int) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).all()

    def get_unread_count(self, user_id: int) -> int:
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read_at == None
        ).count()

    def mark_as_read(self, user_id: int):
        notifications = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read_at == None
        ).all()
        for notification in notifications:
            notification.read_at = datetime.utcnow()
        self.db.commit()
