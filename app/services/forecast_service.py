"""
Service layer for 30-day conflict forecasting.
"""

from datetime import date, timedelta

from app.schemas.forecast import ForecastPoint, ForecastResponse


async def generate_forecast(
    event_id: str | None = None,
    region: str | None = None,
    severity: float | None = None,
    horizon_days: int = 30,
) -> ForecastResponse:
    """
    Generate 30-day conflict severity predictions.

    TODO: Replace stub with ML model (time-series forecasting).
    """
    import random
    random.seed(42)  # reproducible stub

    base_severity = severity if severity is not None else 5.0
    today = date.today()

    predictions = []
    for day in range(horizon_days):
        current_date = today + timedelta(days=day + 1)
        drift = random.uniform(-0.3, 0.4)
        sev = max(0, min(10, base_severity + drift * (day / 10)))
        predictions.append(
            ForecastPoint(
                date=current_date,
                severity=round(sev, 2),
                confidence_low=round(max(0, sev - 1.5), 2),
                confidence_high=round(min(10, sev + 1.5), 2),
                key_drivers=["troop movements", "diplomatic talks"]
                if day % 7 == 0
                else [],
            )
        )

    # Determine trend
    first_half = sum(p.severity for p in predictions[: horizon_days // 2])
    second_half = sum(p.severity for p in predictions[horizon_days // 2 :])
    trend = (
        "escalating" if second_half > first_half * 1.1
        else "de-escalating" if second_half < first_half * 0.9
        else "stable"
    )

    return ForecastResponse(
        event_id=event_id,
        region=region,
        severity_filter=severity,
        horizon_days=horizon_days,
        predictions=predictions,
        trend=trend,
        model_version="v1.0-stub",
    )
