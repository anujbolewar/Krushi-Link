from datetime import date, timedelta
from typing import List


class NCDEXClientMock:
    """Mock NCDEX API client returning simple synthetic spot/futures data."""

    def fetch_prices(self, commodity: str) -> List[dict]:
        today = date.today()
        data: List[dict] = []
        base_price = 100.0
        for i in range(30):
            d = today - timedelta(days=i)
            # Simple seasonal-ish variation
            price = base_price + (i * 0.5)
            data.append(
                {
                    "date": d.isoformat(),
                    "commodity": commodity,
                    "price": price,
                    "volume": 1000 + i * 10,
                    "exchange": "NCDEX",
                }
            )
        return data


class APMCClientMock:
    """Mock APMC API client returning synthetic mandi modal prices."""

    def fetch_prices(self, commodity: str) -> List[dict]:
        today = date.today()
        data: List[dict] = []
        base_price = 95.0
        for i in range(30):
            d = today - timedelta(days=i)
            modal = base_price + (i * 0.4)
            data.append(
                {
                    "date": d.isoformat(),
                    "commodity": commodity,
                    "market": "Pune",
                    "min_price": modal * 0.95,
                    "max_price": modal * 1.05,
                    "modal_price": modal,
                }
            )
        return data

