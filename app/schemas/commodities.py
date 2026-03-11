"""
Pydantic models for commodity price data (Brent oil & natural gas).
"""

from pydantic import BaseModel, Field
from datetime import datetime


class CommodityPrice(BaseModel):
    commodity: str = Field(..., description="e.g. 'brent_oil' or 'natural_gas'")
    price: float = Field(..., description="Current price in USD")
    currency: str = "USD"
    change_percent: float = Field(0.0, description="% change from previous close")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CommodityResponse(BaseModel):
    brent_oil: CommodityPrice
    natural_gas: CommodityPrice
