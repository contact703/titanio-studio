#!/usr/bin/env python3
import json
import os
import time
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import BalanceAllowanceParams, AssetType, MarketOrderArgs, OrderType

ROOT = Path(__file__).parent.parent
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)
LOG_FILE = DATA / "autotrader.log"
STATE_FILE = DATA / "autotrader_state.json"
TRADES_FILE = DATA / "autotrader_trades.jsonl"
WALLET_FILE = Path("/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/cofre/polymarket-wallet.json")

MAX_POSITIONS = 3
STAKE_USDC = 1.0
MIN_CONF = 0.60
SCAN_SECONDS = 300


def log(msg: str):
    line = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def load_client():
    load_dotenv(ROOT / ".env")
    host = os.getenv("CLOB_HOST", "https://clob.polymarket.com")
    chain_id = int(os.getenv("CHAIN_ID", "137"))

    w = json.loads(WALLET_FILE.read_text())
    key = w["private_key"]
    if not key.startswith("0x"):
        key = "0x" + key

    client = ClobClient(host, key=key, chain_id=chain_id)
    creds = client.create_or_derive_api_creds()
    client.set_api_creds(creds)
    return client


def get_collateral_balance(client) -> float:
    try:
        r = client.get_balance_allowance(BalanceAllowanceParams(asset_type=AssetType.COLLATERAL, signature_type=1))
        b = float(r.get("balance", "0")) / 1_000_000.0
        return b
    except Exception:
        return 0.0


def pick_candidates(client, limit=50):
    data = client.get_sampling_markets()
    markets = data.get("data", []) if isinstance(data, dict) else []
    picks = []

    for m in markets[:limit]:
        if not m.get("active") or m.get("closed"):
            continue
        if not m.get("accepting_orders"):
            continue
        tokens = m.get("tokens", [])
        if len(tokens) < 2:
            continue

        # escolhe lado com preço "barato" (0.25-0.40)
        yes = tokens[0]
        no = tokens[1]
        candidates = [yes, no]
        for t in candidates:
            p = float(t.get("price", 0) or 0)
            if 0.25 <= p <= 0.40:
                conf = 1.0 - abs(0.33 - p)  # heurística simples
                if conf >= MIN_CONF:
                    picks.append({
                        "question": m.get("question", "?"),
                        "token_id": t.get("token_id"),
                        "price": p,
                        "outcome": t.get("outcome"),
                        "conf": round(conf, 3),
                        "condition_id": m.get("condition_id"),
                    })

    picks = sorted(picks, key=lambda x: x["conf"], reverse=True)
    return picks[:MAX_POSITIONS]


def place_market_buy(client, token_id: str, amount: float):
    order = client.create_market_order(
        MarketOrderArgs(
            token_id=token_id,
            amount=amount,
            side="BUY",
            order_type=OrderType.FOK,
        )
    )
    return client.post_order(order, orderType=OrderType.FOK)


def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2))


def append_trade(rec: dict):
    with open(TRADES_FILE, "a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")


def run():
    log("AUTO-TRADER iniciando")
    client = load_client()

    state = {
        "started_at": datetime.now().isoformat(),
        "last_scan": None,
        "last_trade": None,
        "status": "running",
        "notes": "",
    }
    save_state(state)

    while True:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        state["last_scan"] = now

        bal = get_collateral_balance(client)
        log(f"Saldo USDC bot: {bal:.4f}")

        if bal < STAKE_USDC:
            state["notes"] = f"Sem saldo suficiente para trade (bal={bal:.4f})"
            save_state(state)
            log("Sem saldo suficiente. Mantendo monitoramento.")
            time.sleep(SCAN_SECONDS)
            continue

        picks = pick_candidates(client, limit=80)
        if not picks:
            state["notes"] = "Nenhuma oportunidade com critério atual"
            save_state(state)
            log("Nenhuma oportunidade elegível.")
            time.sleep(SCAN_SECONDS)
            continue

        traded = 0
        for p in picks:
            if traded >= MAX_POSITIONS:
                break
            try:
                resp = place_market_buy(client, p["token_id"], STAKE_USDC)
                rec = {
                    "ts": now,
                    "question": p["question"],
                    "outcome": p["outcome"],
                    "price": p["price"],
                    "amount_usdc": STAKE_USDC,
                    "resp": resp,
                }
                append_trade(rec)
                state["last_trade"] = now
                log(f"TRADE OK: {p['outcome']} | {p['question'][:80]}")
                traded += 1
            except Exception as e:
                log(f"TRADE FAIL: {p['outcome']} | {str(e)[:180]}")

        save_state(state)
        time.sleep(SCAN_SECONDS)


if __name__ == "__main__":
    run()
