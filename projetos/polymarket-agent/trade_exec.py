#!/usr/bin/env python3
"""Execute the actual trade on Polymarket."""
import json, sys, time

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import OrderArgs, OrderType
from py_clob_client.order_builder.constants import BUY

PRIVATE_KEY = "0xa2b02addba8f04341335947337087162174d7177b5db50a4a71b424bf4836781"
HOST = "https://clob.polymarket.com"
CHAIN_ID = 137
TOKEN_ID = "21296624965887450804742516563526632324551397901259017139941826024484477821625"

print("=== Init client ===")
client = ClobClient(HOST, key=PRIVATE_KEY, chain_id=CHAIN_ID)

print("=== Derive API key ===")
api_creds = client.derive_api_key()
print(f"API key: {api_creds.api_key}")
client.set_api_creds(api_creds)

print("\n=== Get order book ===")
book = client.get_order_book(TOKEN_ID)
if hasattr(book, 'asks') and book.asks:
    best_ask = float(book.asks[0].price)
    print(f"Best ask: {best_ask}")
else:
    best_ask = 0.98
    print(f"No asks, using default: {best_ask}")

if hasattr(book, 'bids') and book.bids:
    best_bid = float(book.bids[0].price)
    print(f"Best bid: {best_bid}")

# Use a reasonable price - try at best ask to get filled immediately
price = best_ask
size = round(5.0 / price, 1)  # $5 worth
print(f"\nPlacing order: BUY {size} shares of Italy YES at ${price}")

print("\n=== Creating order ===")
try:
    order_args = OrderArgs(
        token_id=TOKEN_ID,
        price=price,
        size=size,
        side=BUY,
    )
    
    signed_order = client.create_order(order_args)
    print(f"Order created/signed")
    print(f"Order details: {json.dumps(signed_order if isinstance(signed_order, dict) else str(signed_order), indent=2, default=str)}")
    
    print("\n=== Posting order ===")
    result = client.post_order(signed_order, OrderType.GTC)
    print(f"\n>>> ORDER POSTED! <<<")
    print(f"Result: {json.dumps(result if isinstance(result, dict) else str(result), indent=2, default=str)}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    
    # Try alternative: create_and_post_order with OrderArgs object
    print("\n=== Trying create_and_post_order ===")
    try:
        order_args = OrderArgs(
            token_id=TOKEN_ID,
            price=price,
            size=size,
            side=BUY,
        )
        result = client.create_and_post_order(order_args)
        print(f"\n>>> ORDER POSTED (method 2)! <<<")
        print(f"Result: {json.dumps(result if isinstance(result, dict) else str(result), indent=2, default=str)}")
    except Exception as e2:
        print(f"Error method 2: {e2}")
        traceback.print_exc()
