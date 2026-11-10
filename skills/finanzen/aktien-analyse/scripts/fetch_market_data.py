#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["yfinance>=0.2.63", "pandas>=2.0.0"]
# ///
"""Marktdaten für die aktien-analyse holen (yfinance + Yahoo-RSS).

  python3 fetch_market_data.py --ticker NVDA --type all --out-dir RUN/data
  python3 fetch_market_data.py --ticker NVDA --type technical
  uv run --script fetch_market_data.py --ticker NVDA --type all --out-dir RUN/data

--type all holt technical, news, fundamentals und macro parallel. Mit --out-dir
schreibt es je Typ eine JSON-Datei und gibt nur eine Statuszeile pro Typ aus;
ohne --out-dir landet alles als JSON auf stdout.

Exit-Codes: 0 = alles da, 1 = Teile fehlen, 2 = Ticker ungültig,
3 = kein Typ erreichbar (Netzwerk gesperrt?).

Basiert auf scripts/fetch_market_data.py aus lucemia/trading-agents-plugin
(MIT, Copyright (c) 2026 David Chen).
"""
import argparse
import json
import math
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path


def _ensure_deps():
    try:
        import pandas  # noqa: F401
        import yfinance  # noqa: F401
        return
    except ImportError:
        pass
    pkgs = ["yfinance>=0.2.63", "pandas>=2.0.0"]
    base = [sys.executable, "-m", "pip", "install", "--quiet", *pkgs]
    for cmd in (base, base + ["--user"], base + ["--break-system-packages"]):
        if subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0:
            return
    print(json.dumps({"error": "yfinance/pandas nicht installierbar (pip blockiert?)"}))
    sys.exit(3)


_ensure_deps()

import pandas as pd  # noqa: E402
import yfinance as yf  # noqa: E402

TYPES = ["technical", "news", "fundamentals", "macro"]


def _safe(val):
    try:
        f = float(val)
        return None if math.isnan(f) or math.isinf(f) else round(f, 2)
    except (TypeError, ValueError):
        return None


def _ratio(a, b, scale=1.0):
    a, b = _safe(a), _safe(b)
    if a is None or b in (None, 0):
        return None
    return _safe(a / b * scale)


class InvalidTicker(Exception):
    pass


def _yahoo_reachable() -> bool:
    # yfinance liefert bei gesperrtem Netz oft nur leere Daten statt eines Fehlers.
    # Ohne diese Probe sähe ein blockiertes Netz aus wie ein ungültiger Ticker.
    req = urllib.request.Request("https://query1.finance.yahoo.com/", headers={"User-Agent": "Mozilla/5.0"})
    try:
        urllib.request.urlopen(req, timeout=10)
    except urllib.error.HTTPError:
        return True  # Server antwortet, nur nicht mit 200
    except Exception:  # noqa: BLE001
        return False
    return True


def _no_data(msg: str) -> Exception:
    return InvalidTicker(msg) if _yahoo_reachable() else ConnectionError("Yahoo Finance nicht erreichbar")


def fetch_technical(ticker: str, as_of: date) -> dict:
    end = as_of + timedelta(days=1)
    start = as_of - timedelta(days=520)
    hist = yf.Ticker(ticker).history(start=start.isoformat(), end=end.isoformat())
    if hist.empty:
        raise _no_data(f"Keine Kursdaten für {ticker}")

    close = hist["Close"]

    ema10 = close.ewm(span=10).mean()
    sma50 = close.rolling(50).mean()
    sma200 = close.rolling(200).mean()

    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rsi = (100 - (100 / (1 + gain / loss.replace(0, float("nan"))))).fillna(100)

    macd = close.ewm(span=12).mean() - close.ewm(span=26).mean()
    signal = macd.ewm(span=9).mean()

    sma20 = close.rolling(20).mean()
    std20 = close.rolling(20).std()

    high, low = hist["High"], hist["Low"]
    tr = pd.concat(
        [high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1
    ).max(axis=1)
    atr = tr.rolling(14).mean()

    current = float(close.iloc[-1])
    prev_close = float(close.iloc[-2]) if len(close) >= 2 else None

    return {
        "ticker": ticker,
        "as_of": as_of.isoformat(),
        "last_trading_day": hist.index[-1].date().isoformat(),
        "price": {
            "current": _safe(current),
            "prev_close": _safe(prev_close),
            "change_pct": _ratio(current - prev_close, prev_close, 100) if prev_close else None,
            "52w_high": _safe(close.rolling(252, min_periods=1).max().iloc[-1]),
            "52w_low": _safe(close.rolling(252, min_periods=1).min().iloc[-1]),
        },
        "indicators": {
            "ema10": _safe(ema10.iloc[-1]),
            "sma50": _safe(sma50.iloc[-1]),
            "sma200": _safe(sma200.iloc[-1]),
            "rsi14": _safe(rsi.iloc[-1]),
            "macd": _safe(macd.iloc[-1]),
            "macd_signal": _safe(signal.iloc[-1]),
            "macd_hist": _safe(macd.iloc[-1] - signal.iloc[-1]),
            "boll_upper": _safe((sma20 + 2 * std20).iloc[-1]),
            "boll_mid": _safe(sma20.iloc[-1]),
            "boll_lower": _safe((sma20 - 2 * std20).iloc[-1]),
            "atr14": _safe(atr.iloc[-1]),
            "atr14_pct_of_price": _ratio(atr.iloc[-1], current, 100),
        },
        "recent_closes": {i.date().isoformat(): _safe(v) for i, v in close.tail(10).items()},
    }


def _yf_news(symbol: str, limit: int) -> list[dict]:
    items = []
    for n in (yf.Ticker(symbol).news or [])[:limit]:
        c = n.get("content", {})
        items.append({
            "title": c.get("title", n.get("title", "")),
            "summary": c.get("summary", ""),
            "publisher": c.get("provider", {}).get("displayName", ""),
            "published": (c.get("pubDate") or "")[:10],
        })
    return items


def _rss_news(symbol: str, limit: int) -> list[dict]:
    # Yahoos RSS-Feed pro Symbol, falls der yfinance-News-Endpunkt leer bleibt.
    url = "https://feeds.finance.yahoo.com/rss/2.0/headline?" + urllib.parse.urlencode(
        {"s": symbol, "region": "US", "lang": "en-US"}
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        root = ET.fromstring(resp.read())
    items = []
    for it in root.iter("item"):
        try:
            published = parsedate_to_datetime(it.findtext("pubDate", "")).date().isoformat()
        except (TypeError, ValueError):
            published = ""
        items.append({
            "title": it.findtext("title", ""),
            "summary": it.findtext("description", ""),
            "publisher": urllib.parse.urlparse(it.findtext("link", "")).hostname or "",
            "published": published,
        })
        if len(items) >= limit:
            break
    return items


def _news(symbol: str, limit: int) -> list[dict]:
    errors = []
    for source in (_yf_news, _rss_news):
        try:
            items = source(symbol, limit)
            if items:
                return items
        except Exception as e:  # noqa: BLE001
            errors.append(f"{source.__name__}: {e}")
    if errors and len(errors) == 2:
        raise ConnectionError("; ".join(errors))
    return []


def fetch_news(ticker: str, as_of: date) -> dict:
    # Beide Quellen liefern die neuesten Meldungen, unabhängig von as_of.
    items = _news(ticker, 15)
    return {"ticker": ticker, "as_of": as_of.isoformat(), "news_count": len(items), "items": items}


def fetch_macro(ticker: str, as_of: date) -> dict:
    proxies = {
        "^GSPC": "S&P 500",
        "^TNX": "10Y Treasury Yield",
        "GC=F": "Gold Futures",
        "CL=F": "Crude Oil Futures",
    }
    items, seen, failures = [], set(), 0
    for sym, label in proxies.items():
        try:
            news = _news(sym, 5)
        except ConnectionError:
            failures += 1
            continue
        for n in news:
            if n["title"] and n["title"] not in seen:
                seen.add(n["title"])
                items.append({"source": label, **n})
    if failures == len(proxies):
        raise ConnectionError("Keine Makro-Quelle erreichbar")
    return {"as_of": as_of.isoformat(), "macro_news_count": len(items), "items": items[:20]}


def _stmt_to_dict(df) -> dict:
    if df is None or df.empty:
        return {}
    out = {}
    for col in df.columns[:2]:
        label = col.date().isoformat() if hasattr(col, "date") else str(col)
        out[label] = {
            str(idx): (_safe(v) if isinstance(v, float) else v)
            for idx, v in df[col].items()
            if v is not None and not (isinstance(v, float) and math.isnan(v))
        }
    return out


def _latest(stmt: dict, key: str):
    for period in stmt.values():
        if key in period:
            return period[key]
    return None


def fetch_fundamentals(ticker: str, as_of: date) -> dict:
    tk = yf.Ticker(ticker)
    info = tk.info or {}
    if not info.get("quoteType") and not info.get("marketCap"):
        raise _no_data(f"Keine Fundamentaldaten für {ticker}")

    keys = [
        "currentPrice", "marketCap", "sharesOutstanding",
        "trailingPE", "forwardPE", "priceToBook",
        "revenueGrowth", "earningsGrowth", "grossMargins", "operatingMargins",
        "profitMargins", "returnOnEquity", "returnOnAssets",
        "totalRevenue", "totalCash", "totalDebt", "freeCashflow", "currentRatio",
        "dividendYield", "beta", "shortRatio",
        "recommendationMean", "numberOfAnalystOpinions",
        "targetMeanPrice", "targetHighPrice", "targetLowPrice",
        "sector", "industry", "longBusinessSummary",
    ]
    data = {k: info.get(k) for k in keys}
    data["ticker"] = ticker
    data["as_of"] = as_of.isoformat()
    if data["currentPrice"] is None:
        data["currentPrice"] = info.get("regularMarketPrice") or _safe(
            getattr(tk, "fast_info", {}).get("last_price")
        )
    for k, v in list(data.items()):
        if isinstance(v, float):
            data[k] = _safe(v)

    for name, attr in (
        ("quarterly_income_stmt", "quarterly_income_stmt"),
        ("quarterly_balance_sheet", "quarterly_balance_sheet"),
        ("quarterly_cashflow", "quarterly_cashflow"),
    ):
        try:
            data[name] = _stmt_to_dict(getattr(tk, attr))
        except Exception:  # noqa: BLE001
            data[name] = {}

    # Abgeleitete Kennzahlen hier ausrechnen, damit die Analysten nicht rechnen müssen.
    equity = _latest(data["quarterly_balance_sheet"], "Stockholders Equity")
    growth = data.get("earningsGrowth")
    price = data.get("currentPrice")
    data["derived"] = {
        "stockholders_equity": equity,
        "debt_to_equity": _ratio(data.get("totalDebt"), equity),
        "debt_to_capital": _ratio(
            data.get("totalDebt"), (data.get("totalDebt") or 0) + (equity or 0)
        ) if equity else None,
        "net_cash": _safe((data.get("totalCash") or 0) - (data.get("totalDebt") or 0))
        if data.get("totalCash") is not None and data.get("totalDebt") is not None else None,
        "peg_forward": _ratio(data.get("forwardPE"), growth * 100) if growth and growth > 0 else None,
        "upside_to_mean_target_pct": _ratio((data.get("targetMeanPrice") or 0) - price, price, 100)
        if price and data.get("targetMeanPrice") else None,
        "upside_to_low_target_pct": _ratio((data.get("targetLowPrice") or 0) - price, price, 100)
        if price and data.get("targetLowPrice") else None,
    }
    return data


FETCHERS = {
    "technical": fetch_technical,
    "news": fetch_news,
    "fundamentals": fetch_fundamentals,
    "macro": fetch_macro,
}


def _run(kind: str, ticker: str, as_of: date) -> tuple[str, dict]:
    try:
        return "ok", FETCHERS[kind](ticker, as_of)
    except InvalidTicker as e:
        return "invalid_ticker", {"error": str(e)}
    except Exception as e:  # noqa: BLE001
        return "error", {"error": f"{type(e).__name__}: {e}"}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", required=True)
    parser.add_argument("--type", required=True, choices=TYPES + ["all"])
    parser.add_argument("--date", default=date.today().isoformat())
    parser.add_argument("--out-dir", help="je Typ eine JSON-Datei hierhin schreiben")
    args = parser.parse_args()

    ticker = args.ticker.strip().upper()
    as_of = date.fromisoformat(args.date)
    kinds = TYPES if args.type == "all" else [args.type]

    with ThreadPoolExecutor(max_workers=len(kinds)) as pool:
        results = dict(zip(kinds, pool.map(lambda k: _run(k, ticker, as_of), kinds)))

    statuses = {k: s for k, (s, _) in results.items()}
    if args.out_dir:
        out = Path(args.out_dir)
        out.mkdir(parents=True, exist_ok=True)
        for kind, (status, payload) in results.items():
            (out / f"{kind}.json").write_text(json.dumps(payload, indent=2, default=str))
            note = payload.get("error", "") if status != "ok" else ""
            print(f"{kind}: {status} -> {out / (kind + '.json')} {note}".rstrip())
    else:
        payload = {k: p for k, (_, p) in results.items()}
        print(json.dumps(payload if len(kinds) > 1 else payload[kinds[0]], indent=2, default=str))

    if "invalid_ticker" in statuses.values():
        sys.exit(2)
    if all(s != "ok" for s in statuses.values()):
        sys.exit(3)
    if any(s != "ok" for s in statuses.values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
