from datetime import date, timedelta
from typing import Dict, List

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from xgboost import XGBRegressor

from app.models.core import PriceHistory
from app.services.price_sources import APMCClientMock, NCDEXClientMock


class PriceForecaster:
    """
    MVP implementation that:
    - fetches mock NCDEX/APMC data and stores it in PriceHistory,
    - trains a simple XGBoost regressor on historical prices,
    - produces forecasts with synthetic confidence intervals,
    - recommends an optimal sell window based on predicted peak.
    """

    def __init__(self, db: Session) -> None:
        self.db = db
        self._models: Dict[str, XGBRegressor] = {}
        self._ncdex = NCDEXClientMock()
        self._apmc = APMCClientMock()

    # 3.1 - Data fetching and parsing
    def fetch_training_data(self, crop_type: str) -> List[PriceHistory]:
        """Fetch mock NCDEX/APMC data and persist to PriceHistory."""
        # Fetch from mocks
        ncdex_data = self._ncdex.fetch_prices(crop_type)
        apmc_data = self._apmc.fetch_prices(crop_type)

        for rec in ncdex_data:
            if (
                self.db.query(PriceHistory)
                .filter(
                    PriceHistory.date == date.fromisoformat(rec["date"]),
                    PriceHistory.commodity == rec["commodity"],
                    PriceHistory.source == "ncdex",
                )
                .first()
                is None
            ):
                self.db.add(
                    PriceHistory(
                        date=date.fromisoformat(rec["date"]),
                        commodity=rec["commodity"],
                        modal_price=rec["price"],
                        volume=rec["volume"],
                        exchange=rec["exchange"],
                        source="ncdex",
                    )
                )

        for rec in apmc_data:
            if (
                self.db.query(PriceHistory)
                .filter(
                    PriceHistory.date == date.fromisoformat(rec["date"]),
                    PriceHistory.commodity == rec["commodity"],
                    PriceHistory.source == "apmc",
                )
                .first()
                is None
            ):
                self.db.add(
                    PriceHistory(
                        date=date.fromisoformat(rec["date"]),
                        commodity=rec["commodity"],
                        market=rec["market"],
                        min_price=rec["min_price"],
                        max_price=rec["max_price"],
                        modal_price=rec["modal_price"],
                        source="apmc",
                    )
                )

        self.db.commit()

        return (
            self.db.query(PriceHistory)
            .filter(PriceHistory.commodity == crop_type)
            .order_by(PriceHistory.date.asc())
            .all()
        )

    # 3.2 - XGBoost forecasting model
    def train_model(self, crop_type: str) -> None:
        history = self.fetch_training_data(crop_type)
        if len(history) < 10:
            raise ValueError("Insufficient historical data for training.")

        df = pd.DataFrame(
            [
                {
                    "date": h.date,
                    "modal_price": h.modal_price
                    or h.max_price
                    or h.min_price
                    or 100.0,
                }
                for h in history
            ]
        )
        df = df.sort_values("date").reset_index(drop=True)
        df["t"] = np.arange(len(df))

        X = df[["t"]].values
        y = df["modal_price"].values

        model = XGBRegressor(
            n_estimators=80,
            max_depth=3,
            learning_rate=0.08,
            subsample=0.9,
            objective="reg:squarederror",
        )
        model.fit(X, y)
        self._models[crop_type] = model

    def _ensure_model(self, crop_type: str) -> XGBRegressor:
        model = self._models.get(crop_type)
        if model is None:
            self.train_model(crop_type)
            model = self._models[crop_type]
        return model

    def forecast_price(
        self,
        crop_type: str,
        forecast_days: List[int] | None = None,
    ) -> dict:
        if forecast_days is None:
            forecast_days = [7, 14, 21]

        history = self.fetch_training_data(crop_type)
        if not history:
            raise ValueError("Insufficient historical data for this crop.")

        model = self._ensure_model(crop_type)

        last_index = len(history) - 1
        predictions: List[dict] = []
        for d in forecast_days:
            t_future = np.array([[last_index + d]])
            base = float(model.predict(t_future)[0])
            # Synthetic ±10% interval
            low = base * 0.9
            high = base * 1.1
            predictions.append(
                {
                    "days_ahead": d,
                    "predicted_price": round(base, 2),
                    "confidence_interval_low": round(low, 2),
                    "confidence_interval_high": round(high, 2),
                }
            )

        today = date.today()
        optimal = max(predictions, key=lambda p: p["predicted_price"])
        optimal_date = today + timedelta(days=optimal["days_ahead"])

        return {
            "crop_type": crop_type,
            "forecast_date": today.isoformat(),
            "predictions": predictions,
            "optimal_sell_window": {
                "start": optimal_date.isoformat(),
                "end": (optimal_date + timedelta(days=3)).isoformat(),
            },
            "data_sources": ["NCDEX (mock)", "APMC (mock)"],
        }

    # 3.3 - Sell window recommendation
    def recommend_sell_window(self, crop_type: str) -> dict:
        forecast = self.forecast_price(crop_type)
        return {
            "crop_type": forecast["crop_type"],
            "optimal_sell_window": forecast["optimal_sell_window"],
            "predictions": forecast["predictions"],
        }


