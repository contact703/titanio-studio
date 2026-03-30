#!/usr/bin/env python3
"""Execute trade on Polymarket via CLOB API using private key."""
import json, sys

# First, let's check what we can do with the private key
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import ApiCreds

PRIVATE_KEY = "0xa2b02addba8f04341335947337087162174d7177b5db50a4a71b424bf4836781"
PROXY_WALLET = "0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0"
HOST = "https://clob.polymarket.com"
CHAIN_ID = 137  # Polygon

# Italy YES token
TOKEN_ID = "21296624965887450804742516563526632324551397901259017139941826024484477821625"

print("=== Step 1: Initialize client ===")
try:
    client = ClobClient(HOST, key=PRIVATE_KEY, chain_id=CHAIN_ID)
    print(f"Client initialized")
    print(f"Client address: {client.creds_address if hasattr(client, 'creds_address') else 'unknown'}")
except Exception as e:
    print(f"Client init error: {e}")
    sys.exit(1)

print("\n=== Step 2: Derive API key ===")
try:
    api_creds = client.derive_api_key()
    print(f"API creds derived: {json.dumps(api_creds.__dict__ if hasattr(api_creds, '__dict__') else str(api_creds), indent=2, default=str)}")
except Exception as e:
    print(f"Derive API key error: {e}")
    # Try to create API key instead
    print("Trying create_api_key...")
    try:
        api_creds = client.create_api_key()
        print(f"API key created: {json.dumps(api_creds.__dict__ if hasattr(api_creds, '__dict__') else str(api_creds), indent=2, default=str)}")
    except Exception as e2:
        print(f"Create API key error: {e2}")
        sys.exit(1)

print("\n=== Step 3: Set API creds and check balance ===")
try:
    client.set_api_creds(api_creds)
    print("API creds set")
except Exception as e:
    print(f"Set creds error: {e}")

# Get market info first
print("\n=== Step 4: Get market info for Italy ===")
try:
    # Check the order book
    book = client.get_order_book(TOKEN_ID)
    print(f"Order book retrieved")
    if hasattr(book, 'asks') and book.asks:
        best_ask = book.asks[0]
        print(f"Best ask: price={best_ask.price}, size={best_ask.size}")
    if hasattr(book, 'bids') and book.bids:
        best_bid = book.bids[0]
        print(f"Best bid: price={best_bid.price}, size={best_bid.size}")
except Exception as e:
    print(f"Order book error: {e}")

print("\n=== Step 5: Get midpoint/price ===")
try:
    midpoint = client.get_midpoint(TOKEN_ID)
    print(f"Midpoint: {midpoint}")
except Exception as e:
    print(f"Midpoint error: {e}")

print("\n=== Step 6: Place BUY order ===")
try:
    from py_clob_client.order_builder.constants import BUY
    
    # Get current best ask price
    book = client.get_order_book(TOKEN_ID)
    if hasattr(book, 'asks') and book.asks:
        best_ask_price = float(book.asks[0].price)
        print(f"Using best ask price: {best_ask_price}")
    else:
        # Use midpoint
        mid = client.get_midpoint(TOKEN_ID)
        best_ask_price = float(mid) + 0.01
        print(f"Using midpoint+1c: {best_ask_price}")
    
    # Build order: $5 worth at market price
    # size = amount / price
    size = round(5.0 / best_ask_price, 2)
    print(f"Order: BUY {size} shares at {best_ask_price}")
    
    order = client.create_and_post_order(
        {
            "token_id": TOKEN_ID,
            "price": best_ask_price,
            "size": size,
            "side": BUY,
        }
    )
    print(f"\n>>> ORDER PLACED! <<<")
    print(f"Result: {json.dumps(order if isinstance(order, dict) else str(order), indent=2, default=str)}")
    
except Exception as e:
    print(f"Order error: {e}")
    import traceback
    traceback.print_exc()
