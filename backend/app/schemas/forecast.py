from datetime import date
from typing import List

from pydantic import BaseModel


class PricePrediction(BaseModel):
    days_ahead: int
    predicted_price: float
    confidence_interval_low: float
    confidence_interval_high: float


class DateRange(BaseModel):
    start: date
    end: date


class PriceForecast(BaseModel):
    crop_type: str
    forecast_date: date
    predictions: List[PricePrediction]
    optimal_sell_window: DateRange
    data_sources: List[str]


class SellRecommendation(BaseModel):
    crop_type: str
    optimal_sell_window: DateRange
    predictions: List[PricePrediction]

