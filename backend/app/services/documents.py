from datetime import datetime
from io import BytesIO
from typing import Dict

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session

from app.models.core import FPO
from app.models.lot import Lot
from app.services.qr_codes import QRCODES_ROOT, generate_qr_code


class DocumentGenerator:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _base_canvas(self, title: str) -> tuple[canvas.Canvas, BytesIO]:
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        c.setTitle(title)
        width, height = A4
        # Simple header band
        c.setFillColorRGB(0.11, 0.37, 0.13)
        c.rect(0, height - 30 * mm, width, 30 * mm, stroke=0, fill=1)
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(20 * mm, height - 15 * mm, "AgroVault Export Document")
        return c, buffer

    def _draw_qr(self, c: canvas.Canvas, lot_id: str) -> None:
        qr_rel = generate_qr_code(lot_id)
        qr_path = QRCODES_ROOT / f"{lot_id}.png"
        if qr_path.exists():
            c.drawImage(str(qr_path), 170 * mm, 20 * mm, 30 * mm, 30 * mm, preserveAspectRatio=True)

    def _format_date(self, dt: datetime | None) -> str:
        if not dt:
            return ""
        return dt.strftime("%d/%m/%Y")

    def _format_currency(self, amount: float) -> str:
        # Very simple INR formatting with thousands separator
        return f"₹{amount:,.0f}"

    def generate_phytosanitary_certificate(self, lot_id: str, buyer_info: Dict) -> bytes:
        lot = self.db.query(Lot).filter(Lot.lot_id == lot_id).first()
        if not lot:
            raise ValueError("Lot not found.")
        fpo = self.db.query(FPO).filter(FPO.fpo_id == lot.fpo_id).first()

        c, buffer = self._base_canvas("Phytosanitary Certificate")
        width, height = A4

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(20 * mm, height - 40 * mm, "Phytosanitary Certificate")

        c.setFont("Helvetica", 10)
        y = height - 55 * mm
        c.drawString(20 * mm, y, f"Lot ID: {lot.lot_id}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Crop: {lot.crop_type}  Grade: {lot.grade}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Quantity: {lot.quantity} {lot.unit}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Harvest Date: {lot.harvest_date.strftime('%d/%m/%Y')}")
        y -= 10 * mm

        if fpo:
            c.drawString(20 * mm, y, f"FPO: {fpo.name}")
            y -= 6 * mm
            c.drawString(20 * mm, y, f"FSSAI License: {fpo.fssai_license}")
            y -= 6 * mm
            c.drawString(20 * mm, y, f"APEDA RCMC: {fpo.apeda_rcmc}")
            y -= 10 * mm

        c.drawString(20 * mm, y, f"Buyer: {buyer_info.get('name', '')}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Destination: {buyer_info.get('country', '')}")

        self._draw_qr(c, lot_id)
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def generate_apeda_rcmc_form(self, lot_id: str, fpo_id: str) -> bytes:
        lot = self.db.query(Lot).filter(Lot.lot_id == lot_id).first()
        fpo = self.db.query(FPO).filter(FPO.fpo_id == fpo_id).first()
        if not lot or not fpo:
            raise ValueError("Lot or FPO not found.")

        c, buffer = self._base_canvas("APEDA RCMC Form")
        width, height = A4

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(20 * mm, height - 40 * mm, "APEDA RCMC Application Form")

        c.setFont("Helvetica", 10)
        y = height - 55 * mm
        c.drawString(20 * mm, y, f"FPO Name: {fpo.name}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Registration No.: {fpo.registration_number}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Location: {fpo.location}, {fpo.district}, {fpo.state}")
        y -= 10 * mm
        c.drawString(20 * mm, y, f"Lot ID: {lot.lot_id}  Crop: {lot.crop_type}")

        self._draw_qr(c, lot_id)
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def generate_export_invoice(self, lot_id: str, buyer_info: Dict, price: float) -> bytes:
        lot = self.db.query(Lot).filter(Lot.lot_id == lot_id).first()
        fpo = self.db.query(FPO).filter(FPO.fpo_id == lot.fpo_id).first() if lot else None
        if not lot or not fpo:
            raise ValueError("Lot or FPO not found.")

        c, buffer = self._base_canvas("Export Invoice")
        width, height = A4

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(20 * mm, height - 40 * mm, "Export Invoice")

        c.setFont("Helvetica", 10)
        y = height - 55 * mm
        c.drawString(20 * mm, y, f"Invoice Date: {datetime.utcnow().strftime('%d/%m/%Y')}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Seller (FPO): {fpo.name}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Buyer: {buyer_info.get('name', '')}")
        y -= 10 * mm
        c.drawString(20 * mm, y, f"Lot ID: {lot.lot_id}  Crop: {lot.crop_type}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Quantity: {lot.quantity} {lot.unit}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Price: {self._format_currency(price)}")

        self._draw_qr(c, lot_id)
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def generate_certificate_of_analysis(self, lot_id: str) -> bytes:
        lot = self.db.query(Lot).filter(Lot.lot_id == lot_id).first()
        if not lot:
            raise ValueError("Lot not found.")

        c, buffer = self._base_canvas("Certificate of Analysis")
        width, height = A4

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(20 * mm, height - 40 * mm, "Certificate of Analysis")

        c.setFont("Helvetica", 10)
        y = height - 55 * mm
        c.drawString(20 * mm, y, f"Lot ID: {lot.lot_id}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"Crop: {lot.crop_type}  Grade: {lot.grade}")

        self._draw_qr(c, lot_id)
        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def generate_fssai_compliance_statement(self, fpo_id: str) -> bytes:
        fpo = self.db.query(FPO).filter(FPO.fpo_id == fpo_id).first()
        if not fpo:
            raise ValueError("FPO not found.")

        c, buffer = self._base_canvas("FSSAI Compliance Statement")
        width, height = A4

        c.setFillColorRGB(0, 0, 0)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(20 * mm, height - 40 * mm, "FSSAI Compliance Statement")

        c.setFont("Helvetica", 10)
        y = height - 55 * mm
        c.drawString(20 * mm, y, f"FPO Name: {fpo.name}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"FSSAI License No.: {fpo.fssai_license}")
        y -= 6 * mm
        c.drawString(20 * mm, y, f"APEDA RCMC No.: {fpo.apeda_rcmc}")

        c.showPage()
        c.save()
        pdf = buffer.getvalue()
        buffer.close()
        return pdf

    def generate_all_documents(
        self,
        lot_id: str,
        buyer_info: Dict,
        price: float,
    ) -> Dict[str, bytes]:
        """Generate all five document types in one call."""
        lot = self.db.query(Lot).filter(Lot.lot_id == lot_id).first()
        if not lot:
            raise ValueError("Lot not found.")
        fpo_id = lot.fpo_id

        return {
            "phytosanitary_certificate.pdf": self.generate_phytosanitary_certificate(
                lot_id, buyer_info
            ),
            "apeda_rcmc_form.pdf": self.generate_apeda_rcmc_form(lot_id, fpo_id),
            "export_invoice.pdf": self.generate_export_invoice(lot_id, buyer_info, price),
            "certificate_of_analysis.pdf": self.generate_certificate_of_analysis(lot_id),
            "fssai_compliance_statement.pdf": self.generate_fssai_compliance_statement(
                fpo_id
            ),
        }

