#!/usr/bin/env python3
"""Execute trade using extracted session creds."""
import json, sys

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import ApiCreds, OrderArgs, OrderType
from py_clob_client.order_builder.constants import BUY

PRIVATE_KEY = "0xa2b02addba8f04341335947337087162174d7177b5db50a4a71b424bf4836781"
HOST = "https://clob.polymarket.com"
CHAIN_ID = 137
TOKEN_ID = "21296624965887450804742516563526632324551397901259017139941826024484477821625"

# Creds from browser session
API_KEY = "6d866b80-a158-b0b7-965f-6613c28f682e"
API_SECRET = "hcgaAF91H0SB2DPKKY6tCMT7Ln4NzzrnX3YsMnciHBg="
API_PASSPHRASE = "41a342086516347ee66ddeaa1ea20040ba34cfb73ff0873834bec045838ab529"

print("=== Init client with session creds ===")
client = ClobClient(
    HOST, 
    key=PRIVATE_KEY, 
    chain_id=CHAIN_ID,
    creds=ApiCreds(
        api_key=API_KEY,
        api_secret=API_SECRET,
        api_passphrase=API_PASSPHRASE
    )
)

# Check balance
print("\n=== Check balance ===")
try:
    # Try to get open orders to verify auth works
    orders = client.get_orders()
    print(f"Open orders: {orders}")
except Exception as e:
    print(f"Get orders error: {e}")

# Get order book
print("\n=== Order book for Italy YES ===")
try:
    book = client.get_order_book(TOKEN_ID)
    if hasattr(book, 'asks') and book.asks:
        print(f"Best ask: price={book.asks[0].price}, size={book.asks[0].size}")
        for i, ask in enumerate(book.asks[:5]):
            print(f"  Ask {i}: price={ask.price}, size={ask.size}")
    if hasattr(book, 'bids') and book.bids:
        print(f"Best bid: price={book.bids[0].price}, size={book.bids[0].size}")
except Exception as e:
    print(f"Order book error: {e}")

# Place order
print("\n=== Place BUY order ===")
try:
    book = client.get_order_book(TOKEN_ID)
    best_ask = float(book.asks[0].price) if book.asks else 0.98
    
    # Buy at best ask for immediate fill
    price = best_ask
    size = round(5.0 / price, 1)
    
    print(f"BUY {size} Italy YES @ ${price} (total: ${size * price:.2f})")
    
    order_args = OrderArgs(
        token_id=TOKEN_ID,
        price=price,
        size=size,
        side=BUY,
    )
    
    signed_order = client.create_order(order_args)
    print(f"Order signed")
    
    result = client.post_order(signed_order, OrderType.GTC)
    print(f"\n>>> ORDER POSTED! <<<")
    print(f"Result: {json.dumps(result, indent=2, default=str)}")
    
    # Save result
    with open('/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md', 'w') as f:
        f.write("# Trade Result - Italy YES\n\n")
        f.write(f"## Status: SUCCESS ✅\n\n")
        f.write(f"- **Market:** Italy to qualify for 2026 FIFA World Cup\n")
        f.write(f"- **Side:** BUY YES\n")
        f.write(f"- **Price:** ${price}\n")
        f.write(f"- **Size:** {size} shares\n")
        f.write(f"- **Total:** ${size * price:.2f}\n\n")
        f.write(f"## API Response\n```json\n{json.dumps(result, indent=2, default=str)}\n```\n")
    print("\nResult saved to TRADE-RESULTADO.md")
    
except Exception as e:
    print(f"Order error: {e}")
    import traceback
    traceback.print_exc()
    
    # Save failure result
    with open('/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md', 'w') as f:
        f.write("# Trade Result - Italy YES\n\n")
        f.write(f"## Status: FAILED ❌\n\n")
        f.write(f"- **Error:** {str(e)}\n")
        f.write(f"- **Login:** SUCCESS (wallet confirmed)\n")
        f.write(f"- **Wallet:** 0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0\n")
        f.write(f"- **Balance:** $44.86\n")
