/**
 * services/commodityService.js
 * ----------------------------
 * Service layer for commodity price data.
 * Port of commodity_service.py — stub data, TODO: wire real provider.
 */

export async function fetchCommodityPrices() {
  // TODO: Wire up Alpha Vantage / Yahoo Finance / EIA API
  return {
    brent_oil: {
      commodity: 'brent_oil',
      price: 82.45,
      currency: 'USD',
      change_percent: -1.23,
      timestamp: new Date().toISOString(),
    },
    natural_gas: {
      commodity: 'natural_gas',
      price: 2.87,
      currency: 'USD',
      change_percent: 0.56,
      timestamp: new Date().toISOString(),
    },
  };
}
