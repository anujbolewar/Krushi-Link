from datetime import datetime
from typing import Dict, List

from sqlalchemy.orm import Session

from app.models.core import ExportStandard, FPO
from app.models.lot import Lot


class APEDAMockClient:
    """Mock APEDA client returning simple in-memory MRL tables."""

    def fetch_mrl_tables(self) -> List[dict]:
        # In a full implementation, this would call an external API.
        # For MVP we return an empty list and rely on seeded ExportStandard rows.
        return []


class ExportReadinessChecker:
    def __init__(self, db: Session) -> None:
        self.db = db
        self._apeda = APEDAMockClient()

    def refresh_mrl_tables(self) -> None:
        """
        Fetch APEDA MRL tables via mock client.
        For MVP we assume data is pre-seeded in ExportStandard, so this is a no-op.
        """
        _ = self._apeda.fetch_mrl_tables()

    def validate_mrl(
        self,
        crop_type: str,
        pesticide_residues: Dict[str, float],
        target_market: str,
        grade: str,
    ) -> Dict:
        """
        Validate pesticide residue levels against APEDA MRL limits.
        Grade A uses stricter limits if both A and B/C rows exist.
        """
        results: List[Dict] = []
        for pesticide, level in pesticide_residues.items():
            std = (
                self.db.query(ExportStandard)
                .filter(
                    ExportStandard.crop_type == crop_type,
                    ExportStandard.pesticide == pesticide,
                    ExportStandard.market == target_market,
                    ExportStandard.grade == grade,
                )
                .first()
            )
            if not std and grade == "A":
                # If no explicit Grade A row, fall back to Grade B
                std = (
                    self.db.query(ExportStandard)
                    .filter(
                        ExportStandard.crop_type == crop_type,
                        ExportStandard.pesticide == pesticide,
                        ExportStandard.market == target_market,
                        ExportStandard.grade == "B",
                    )
                    .first()
                )
                # Apply a stricter virtual limit for Grade A
                if std:
                    std = ExportStandard(
                        crop_type=std.crop_type,
                        pesticide=std.pesticide,
                        market=std.market,
                        grade="A",
                        mrl_limit=std.mrl_limit * 0.8,
                    )
            if not std:
                continue
            passed = level <= std.mrl_limit
            results.append(
                {
                    "check_type": "mrl",
                    "pesticide": pesticide,
                    "limit": std.mrl_limit,
                    "value": level,
                    "passed": passed,
                    "details": f"{pesticide}: {level} vs limit {std.mrl_limit}",
                }
            )
        overall_pass = all(r["passed"] for r in results) if results else False
        return {"passed": overall_pass, "checks": results}

    def validate_fssai_license(self, fpo_id: str) -> bool:
        fpo = self.db.query(FPO).filter(FPO.fpo_id == fpo_id).first()
        return bool(fpo and fpo.fssai_license)

    def get_remediation_guidance(
        self,
        validation_result: Dict,
    ) -> List[str]:
        """Provide actionable remediation steps based on failed checks."""
        steps: List[str] = []
        for market_result in validation_result.get("results", []):
            if not market_result["passed"]:
                for check in market_result["checks"]:
                    if check["check_type"] == "mrl" and not check["passed"]:
                        steps.append(
                            f"Reduce or adjust pesticide {check['pesticide']} usage to keep residues below {check['limit']} for {market_result['market']}."
                        )
                    if (
                        check["check_type"] == "fssai_license"
                        and not check["passed"]
                    ):
                        steps.append("Update or renew FSSAI license details for the FPO.")
        # De-duplicate steps
        return list(dict.fromkeys(steps))

    def check_readiness(
        self,
        lot_id: str,
        target_markets: List[str],
        pesticide_residues: Dict[str, float],
    ) -> Dict:
        lot = self.db.query(Lot).filter(Lot.lot_id == lot_id).first()
        if not lot:
            raise ValueError("Lot not found.")

        fssai_ok = self.validate_fssai_license(lot.fpo_id)

        results = []
        for market in target_markets:
            mrl = self.validate_mrl(
                crop_type=lot.crop_type,
                pesticide_residues=pesticide_residues,
                target_market=market,
                grade=lot.grade,
            )
            market_pass = mrl["passed"] and fssai_ok
            checks = mrl["checks"] + [
                {
                    "check_type": "fssai_license",
                    "passed": fssai_ok,
                    "details": "FSSAI license on file"
                    if fssai_ok
                    else "Missing FSSAI license",
                }
            ]
            results.append(
                {
                    "market": market,
                    "passed": market_pass,
                    "checks": checks,
                    "remediation_steps": [],
                }
            )

        report = {
            "lot_id": lot_id,
            "checked_at": datetime.utcnow().isoformat(),
            "results": results,
        }
        # Attach remediation guidance
        steps = self.get_remediation_guidance(report)
        for market_result in report["results"]:
            market_result["remediation_steps"] = steps
        return report


