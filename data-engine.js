
/*
 * FLAWLESS RADAR TERMINAL
 * Unified Data Engine v1.0
 *
 * Markets:
 *   Crypto  -> Binance
 *   Gold    -> Twelve Data
 *   Stocks  -> Twelve Data
 *
 * Output format:
 *   { time, open, high, low, close, volume }
 *
 * Data only. No order execution.
 */

(function () {
  "use strict";

  const CONFIG = {
    binanceBase: "https://api.binance.com/api/v3",
    twelveBase: "https://api.twelvedata.com",

    twelveApiKey: "",

    timeout: 15000,
    maxCandles: 5000
  };

  const SYMBOLS = {
    BTCUSDT: {
      market: "crypto",
      provider: "binance",
      symbol: "BTCUSDT"
    },

    ETHUSDT: {
      market: "crypto",
      provider: "binance",
      symbol: "ETHUSDT"
    },

    SOLUSDT: {
      market: "crypto",
      provider: "binance",
      symbol: "SOLUSDT"
    },

    XAUUSD: {
      market: "gold",
      provider: "twelvedata",
      symbol: "XAU/USD"
    },

    AAPL: {
      market: "stock",
      provider: "twelvedata",
      symbol: "AAPL"
    },

    TSLA: {
      market: "stock",
      provider: "twelvedata",
      symbol: "TSLA"
    },

    NVDA: {
      market: "stock",
      provider: "twelvedata",
      symbol: "NVDA"
    },

    MSFT: {
      market: "stock",
      provider: "twelvedata",
      symbol: "MSFT"
    }
  };

  const INTERVALS = {
    "5m": {
      binance: "5m",
      twelve: "5min"
    },

    "15m": {
      binance: "15m",
      twelve: "15min"
    },

    "30m": {
      binance: "30m",
      twelve: "30min"
    },

    "1h": {
      binance: "1h",
      twelve: "1h"
    },

    "4h": {
      binance: "4h",
      twelve: "4h"
    },

    "1d": {
      binance: "1d",
      twelve: "1day"
    }
  };

  const cache = new Map();

  function normalizeSymbol(input) {
    return String(input || "")
      .toUpperCase()
      .replace("/", "")
      .trim();
  }

  function resolveSymbol(input) {
    const key = normalizeSymbol(input);
    const item = SYMBOLS[key];

    if (!item) {
      throw new Error("Unsupported symbol: " + input);
    }

    return { ...item, key };
  }

  function validateInterval(interval) {
    const value = INTERVALS[interval];

    if (!value) {
      throw new Error("Unsupported interval: " + interval);
    }

    return value;
  }

  async function request(url) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      CONFIG.timeout
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status + ": " + response.statusText
        );
      }

      const data = await response.json();

      if (data && data.status === "error") {
        throw new Error(
          data.message || "Data provider error"
        );
      }

      if (data && data.code && data.msg) {
        throw new Error(data.msg);
      }

      return data;

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Data request timed out");
      }

      throw error;

    } finally {
      clearTimeout(timer);
    }
  }

  function normalizeCandle(candle) {
    return {
      time: Number(candle.time),
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
      volume: Number(candle.volume || 0)
    };
  }

  function validateCandles(candles) {
    return candles.filter(c => {
      return (
        Number.isFinite(c.time) &&
        Number.isFinite(c.open) &&
        Number.isFinite(c.high) &&
        Number.isFinite(c.low) &&
        Number.isFinite(c.close) &&
        c.high >= c.low &&
        c.high >= Math.max(c.open, c.close) &&
        c.low <= Math.min(c.open, c.close)
      );
    });
  }

  async function binanceCandles(symbol, interval, limit) {
    const url = new URL(CONFIG.binanceBase + "/klines");

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("limit", String(limit));

    const rows = await request(url.toString());

    return rows.map(row => ({
      time: Number(row[0]),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
      volume: Number(row[5])
    }));
  }

  async function twelveCandles(symbol, interval, limit) {
    if (!CONFIG.twelveApiKey) {
      throw new Error(
        "Twelve Data API key is not configured"
      );
    }

    const url = new URL(CONFIG.twelveBase + "/time_series");

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", String(limit));
    url.searchParams.set("apikey", CONFIG.twelveApiKey);

    const data = await request(url.toString());

    if (!data.values || !Array.isArray(data.values)) {
      throw new Error(
        data.message || "No candle data returned"
      );
    }

    return data.values
      .map(row => ({
        time: Date.parse(row.datetime + "Z"),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        volume: Number(row.volume || 0)
      }))
      .reverse();
  }

  async function getCandles(symbol, interval, options = {}) {
    const asset = resolveSymbol(symbol);
    const periods = validateInterval(interval);

    const limit = Math.max(
      1,
      Math.min(
        Number(options.limit || 500),
        CONFIG.maxCandles
      )
    );

    const cacheKey =
      asset.key + ":" + interval + ":" + limit;

    const now = Date.now();
    const cached = cache.get(cacheKey);

    const cacheDuration = Number(
      options.cacheMs || 10000
    );

    if (
      cached &&
      now - cached.timestamp < cacheDuration &&
      !options.force
    ) {
      return {
        ...cached.result,
        cached: true
      };
    }

    let candles;

    if (asset.provider === "binance") {
      candles = await binanceCandles(
        asset.symbol,
        periods.binance,
        limit
      );
    } else {
      candles = await twelveCandles(
        asset.symbol,
        periods.twelve,
        limit
      );
    }

    candles = validateCandles(
      candles.map(normalizeCandle)
    );

    if (!candles.length) {
      throw new Error("No valid candles received");
    }

    const result = {
      symbol: asset.key,
      provider: asset.provider,
      market: asset.market,
      interval,
      candles,
      count: candles.length,
      lastPrice: candles[candles.length - 1].close,
      updatedAt: Date.now(),
      cached: false
    };

    cache.set(cacheKey, {
      timestamp: now,
      result
    });

    return result;
  }

  async function getQuote(symbol) {
    const asset = resolveSymbol(symbol);

    if (asset.provider === "binance") {
      const url = new URL(
        CONFIG.binanceBase + "/ticker/price"
      );

      url.searchParams.set("symbol", asset.symbol);

      const data = await request(url.toString());

      return {
        symbol: asset.key,
        market: asset.market,
        provider: asset.provider,
        price: Number(data.price),
        updatedAt: Date.now()
      };
    }

    if (!CONFIG.twelveApiKey) {
      throw new Error(
        "Twelve Data API key is not configured"
      );
    }

    const url = new URL(CONFIG.twelveBase + "/price");

    url.searchParams.set("symbol", asset.symbol);
    url.searchParams.set("apikey", CONFIG.twelveApiKey);

    const data = await request(url.toString());

    if (!data.price) {
      throw new Error(
        data.message || "Quote unavailable"
      );
    }

    return {
      symbol: asset.key,
      market: asset.market,
      provider: asset.provider,
      price: Number(data.price),
      updatedAt: Date.now()
    };
  }

  function configure(options = {}) {
    if (options.twelveApiKey !== undefined) {
      CONFIG.twelveApiKey = String(
        options.twelveApiKey || ""
      ).trim();
    }

    if (options.timeout !== undefined) {
      CONFIG.timeout = Math.max(
        3000,
        Number(options.timeout)
      );
    }

    cache.clear();

    return getStatus();
  }

  function getStatus() {
    return {
      engine: "Unified Data Engine",
      version: "1.0.0",
      providers: {
        binance: "available",
        twelveData: CONFIG.twelveApiKey
          ? "configured"
          : "not-configured"
      },
      markets: [
        "crypto",
        "gold",
        "stocks"
      ],
      realTrading: false
    };
  }

  function getSymbols() {
    return Object.entries(SYMBOLS).map(
      ([key, value]) => ({
        key,
        market: value.market,
        provider: value.provider,
        symbol: value.symbol
      })
    );
  }

  function clearCache() {
    cache.clear();
  }

  window.MarketData = Object.freeze({
    configure,
    getStatus,
    getSymbols,
    getCandles,
    getQuote,
    clearCache
  });

  console.log(
    "[FLAWLESS] Unified Data Engine loaded",
    getStatus()
  );

})();
