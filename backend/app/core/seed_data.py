from sqlalchemy.orm import Session
from app.models.core import FPO, User, Lot

# Seed data for FPOs, Users, and Lots
def seed_data(db: Session):
    # Add sample FPOs
    fpo1 = FPO(name="Pune Agro Co-op", location="Pune")
    fpo2 = FPO(name="Nashik Agro Co-op", location="Nashik")
    db.add_all([fpo1, fpo2])
    db.commit()

    # Add sample Users
    user1 = User(name="Admin", email="admin@example.com", role="Admin", fpo_id=fpo1.id)
    user2 = User(name="Manager", email="manager@example.com", role="FPO_Manager", fpo_id=fpo2.id)
    db.add_all([user1, user2])
    db.commit()

    # Add sample Lots
    lot1 = Lot(crop_type="Mango", quantity="1000 kg", harvest_date="2026-03-01", location="Pune", status="Active", fpo_id=fpo1.id)
    lot2 = Lot(crop_type="Pomegranate", quantity="800 kg", harvest_date="2026-03-02", location="Nashik", status="Pending", fpo_id=fpo2.id)
    db.add_all([lot1, lot2])
    db.commit()
