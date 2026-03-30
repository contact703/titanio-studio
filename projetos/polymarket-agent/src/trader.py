"""
trader.py — Polymarket CLOB Trader
Implementação manual com HMAC-SHA256 para auth L2.

CRUCIAL INSIGHT: O HMAC deve ser assinado com o PATH BASE (sem query string).
A URL com query params é enviada normalmente, mas a assinatura usa só o path base.

Credenciais:
  POLY_API_KEY/SECRET/PASSPHRASE → auth L2 (HMAC headers)
  POLY_SIGNER_ADDRESS → POLY_ADDRESS header (dono das API keys)
  WALLET_PRIVATE_KEY → assinatura EIP-712 das ordens (BOT_WALLET_ADDRESS)
  POLY_PROXY_WALLET → funder da proxy wallet
  
Saldo conta: ~$44.86 USDC disponível (confirmado em 2026-03-27)
"""

import os
import json
import hmac
import hashlib
import base64
import logging
import time
from typing import Optional
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv

import httpx

from py_clob_client.client import ClobClient
from py_clob_client.constants import POLYGON
from py_clob_client.clob_types import (
    ApiCreds,
    OrderArgs,
    MarketOrderArgs,
    OrderType,
)
from py_clob_client.order_builder.constants import BUY, SELL

# Carrega .env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger(__name__)

CLOB_HOST = "https://clob.polymarket.com"


def build_hmac_signature(api_secret: str, timestamp: str, method: str, path: str, body=None) -> str:
    """
    Cria HMAC-SHA256 para autenticação no Polymarket CLOB.
    
    IMPORTANTE: path deve ser o PATH BASE sem query string.
    Exemplo: assinar '/data/orders', mas buscar '/data/orders?next_cursor=MA=='
    """
    message = str(timestamp) + method.upper() + path
    if body:
        message += str(body).replace("'", '"')

    secret_bytes = base64.urlsafe_b64decode(api_secret)
    h = hmac.new(secret_bytes, message.encode("utf-8"), hashlib.sha256)
    return base64.urlsafe_b64encode(h.digest()).decode("utf-8")


def make_auth_headers(method: str, sign_path: str, body=None,
                      api_key: str = None, api_secret: str = None,
                      api_passphrase: str = None, address: str = None) -> dict:
    """
    Gera headers de autenticação L2 para o Polymarket CLOB.
    
    sign_path: PATH BASE sem query string (para o HMAC)
    """
    timestamp = str(int(datetime.now().timestamp()))
    sig = build_hmac_signature(api_secret, timestamp, method, sign_path, body)

    return {
        "POLY_ADDRESS": address,
        "POLY_SIGNATURE": sig,
        "POLY_TIMESTAMP": timestamp,
        "POLY_API_KEY": api_key,
        "POLY_PASSPHRASE": api_passphrase,
        "Content-Type": "application/json",
    }


class PolyTrader:
    """
    Cliente para executar trades no Polymarket via CLOB API.
    
    Usa HMAC-SHA256 para auth L2.
    Para assinar ordens EIP-712, usa py-clob-client com WALLET_PRIVATE_KEY.
    """

    def __init__(self):
        self.api_key = os.getenv("POLY_API_KEY")
        self.api_secret = os.getenv("POLY_API_SECRET")
        self.api_passphrase = os.getenv("POLY_API_PASSPHRASE")
        self.private_key = os.getenv("WALLET_PRIVATE_KEY")
        self.proxy_wallet = os.getenv("POLY_PROXY_WALLET")
        self.signer_address = os.getenv("POLY_SIGNER_ADDRESS")

        if not all([self.api_key, self.api_secret, self.api_passphrase]):
            raise ValueError("Credenciais POLY_API_KEY/SECRET/PASSPHRASE não encontradas no .env")

        # Normaliza chave privada
        if self.private_key and not self.private_key.startswith("0x"):
            self.private_key = "0x" + self.private_key

        self.http = httpx.Client(timeout=30)

        # Cliente py-clob-client para assinatura de ordens EIP-712
        self._clob_client = None
        if self.private_key:
            try:
                creds = ApiCreds(
                    api_key=self.api_key,
                    api_secret=self.api_secret,
                    api_passphrase=self.api_passphrase,
                )
                self._clob_client = ClobClient(
                    host=CLOB_HOST,
                    chain_id=POLYGON,
                    key=self.private_key,
                    creds=creds,
                    signature_type=1,          # proxy wallet
                    funder=self.proxy_wallet,  # POLY_PROXY_WALLET
                )
                logger.info("ClobClient criado com proxy wallet (sig_type=1)")
            except Exception as e:
                logger.warning(f"Não foi possível criar ClobClient: {e}")

        logger.info(f"PolyTrader OK | API: {self.api_key[:8]}... | Address: {self.signer_address}")

    def _headers(self, method: str, path: str, body=None) -> dict:
        """Gera headers HMAC. path = base path SEM query string."""
        return make_auth_headers(
            method=method,
            sign_path=path,
            body=body,
            api_key=self.api_key,
            api_secret=self.api_secret,
            api_passphrase=self.api_passphrase,
            address=self.signer_address,
        )

    def _get(self, base_path: str, query: str = "") -> dict | list:
        """
        GET autenticado.
        base_path: caminho sem query (usado para HMAC)
        query: string de query (ex: '?asset_type=COLLATERAL')
        """
        headers = self._headers("GET", base_path)
        url = CLOB_HOST + base_path + query
        resp = self.http.get(url, headers=headers)
        logger.debug(f"GET {base_path}{query} → {resp.status_code}")
        if resp.status_code >= 400:
            logger.error(f"GET {base_path} error {resp.status_code}: {resp.text}")
        return resp.json()

    def _post(self, base_path: str, data: dict) -> dict:
        """POST autenticado."""
        body_str = json.dumps(data, separators=(',', ':'))
        headers = self._headers("POST", base_path, body_str)
        url = CLOB_HOST + base_path
        resp = self.http.post(url, headers=headers, content=body_str)
        logger.debug(f"POST {base_path} → {resp.status_code}")
        if resp.status_code >= 400:
            logger.error(f"POST {base_path} error {resp.status_code}: {resp.text}")
        return resp.json()

    def _delete(self, base_path: str, data: dict = None) -> dict:
        """DELETE autenticado."""
        body_str = json.dumps(data, separators=(',', ':')) if data else ""
        headers = self._headers("DELETE", base_path, body_str if data else None)
        url = CLOB_HOST + base_path
        resp = self.http.delete(url, headers=headers, content=body_str.encode() if body_str else None)
        logger.debug(f"DELETE {base_path} → {resp.status_code}")
        if resp.status_code >= 400:
            logger.error(f"DELETE {base_path} error {resp.status_code}: {resp.text}")
        return resp.json()

    # ------------------------------------------------------------------
    # CONNECTIVITY TEST
    # ------------------------------------------------------------------

    def test_connection(self) -> dict:
        """Testa conectividade e autenticação."""
        results = {}

        try:
            r = self.http.get(f"{CLOB_HOST}/")
            results["public_ok"] = "OK" if r.status_code == 200 else f"HTTP {r.status_code}"
        except Exception as e:
            results["public_ok"] = f"ERROR: {e}"

        try:
            r = self.http.get(f"{CLOB_HOST}/time")
            results["server_time"] = r.json()
        except Exception as e:
            results["server_time"] = f"ERROR: {e}"

        try:
            result = self._get("/auth/api-keys")
            results["api_keys_auth"] = "OK" if "apiKeys" in result else f"FAIL: {result}"
            results["api_keys"] = result.get("apiKeys", [])
        except Exception as e:
            results["api_keys_auth"] = f"ERROR: {e}"

        try:
            bal = self.get_balance()
            results["balance"] = bal
        except Exception as e:
            results["balance"] = f"ERROR: {e}"

        try:
            orders = self.get_open_orders()
            results["open_orders_count"] = len(orders)
        except Exception as e:
            results["open_orders_count"] = f"ERROR: {e}"

        try:
            trades = self.get_trades()
            results["trades_count"] = len(trades)
        except Exception as e:
            results["trades_count"] = f"ERROR: {e}"

        return results

    # ------------------------------------------------------------------
    # BALANCE
    # ------------------------------------------------------------------

    def get_balance(self) -> dict:
        """
        Retorna saldo USDC da conta.
        API retorna balance em unidades brutas (6 decimais para USDC).
        Ex: 44855299 → $44.86 USDC
        """
        try:
            result = self._get("/balance-allowance", "?asset_type=COLLATERAL&signature_type=1")
            logger.info(f"Balance raw: {result}")

            balance_usdc = 0.0
            allowances = {}

            if isinstance(result, dict):
                if "balance" in result:
                    raw_val = int(result["balance"])
                    balance_usdc = raw_val / 1_000_000  # USDC: 6 decimais

                if "allowances" in result:
                    allowances = {
                        k: int(v) / 1_000_000
                        for k, v in result["allowances"].items()
                    }

            return {
                "balance_usdc": balance_usdc,
                "allowances": allowances,
                "raw": result,
            }
        except Exception as e:
            logger.error(f"Erro ao obter saldo: {e}")
            return {"balance_usdc": 0.0, "error": str(e)}

    # ------------------------------------------------------------------
    # ORDERS - Leitura
    # ------------------------------------------------------------------

    def get_open_orders(self) -> list:
        """Lista todas as ordens abertas."""
        try:
            result = self._get("/data/orders")
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and "data" in result:
                return result["data"]
            return []
        except Exception as e:
            logger.error(f"Erro ao listar ordens: {e}")
            return []

    def get_order(self, order_id: str) -> Optional[dict]:
        """Retorna detalhes de uma ordem específica."""
        try:
            return self._get(f"/data/order/{order_id}")
        except Exception as e:
            logger.error(f"Erro ao buscar ordem {order_id}: {e}")
            return None

    def get_trades(self) -> list:
        """Lista trades executados para este endereço."""
        try:
            result = self._get("/data/trades", f"?maker_address={self.signer_address}")
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and "data" in result:
                return result["data"]
            return []
        except Exception as e:
            logger.error(f"Erro ao listar trades: {e}")
            return []

    def get_market_price(self, token_id: str, side: str = "BUY") -> Optional[float]:
        """Retorna o preço atual de um token no order book."""
        try:
            result = self._get("/price", f"?token_id={token_id}&side={side}")
            if isinstance(result, dict) and "price" in result:
                return float(result["price"])
            return None
        except Exception as e:
            logger.error(f"Erro ao obter preço: {e}")
            return None

    def get_orderbook(self, token_id: str) -> dict:
        """Retorna o order book de um token."""
        try:
            return self._get("/book", f"?token_id={token_id}")
        except Exception as e:
            logger.error(f"Erro ao obter orderbook: {e}")
            return {}

    def get_midpoint(self, token_id: str) -> Optional[float]:
        """Retorna o midpoint price de um token."""
        try:
            result = self._get("/midpoint", f"?token_id={token_id}")
            if isinstance(result, dict) and "mid" in result:
                return float(result["mid"])
            return None
        except Exception as e:
            logger.error(f"Erro ao obter midpoint: {e}")
            return None

    # ------------------------------------------------------------------
    # ORDERS - Escrita
    # ------------------------------------------------------------------

    def place_limit_order(
        self,
        token_id: str,
        side: str,
        amount_usd: float,
        price: float,
    ) -> dict:
        """
        Coloca uma ordem limit (GTC) assinada com EIP-712.
        
        Args:
            token_id: Token ID do outcome (YES ou NO)
            side: "BUY" ou "SELL"
            amount_usd: Valor em USD
            price: Preço limite (0.0 a 1.0)
        
        Returns:
            {"order_id": str, "status": str, "raw": dict}
        """
        if not self._clob_client:
            return {"order_id": None, "status": "error", "error": "ClobClient não disponível"}

        try:
            side_const = BUY if side.upper() == "BUY" else SELL
            # size em shares = USD / price
            size = round(amount_usd / price, 4) if price > 0 else amount_usd

            logger.info(f"Limit order: {side} {size:.4f} shares @ {price:.4f} "
                       f"(~${amount_usd:.2f}) | token: {token_id[:20]}...")

            order_args = OrderArgs(
                token_id=token_id,
                price=price,
                size=size,
                side=side_const,
            )

            resp = self._clob_client.create_and_post_order(order_args)
            logger.info(f"Limit order resposta: {resp}")

            order_id = None
            status = "unknown"
            if isinstance(resp, dict):
                order_id = resp.get("orderID") or resp.get("order_id") or resp.get("id")
                status = resp.get("status", "unknown")
                if "errorMsg" in resp and resp["errorMsg"]:
                    status = f"error: {resp['errorMsg']}"

            return {"order_id": order_id, "status": status, "raw": resp}

        except Exception as e:
            logger.error(f"Erro ao colocar limit order: {e}")
            return {"order_id": None, "status": "error", "error": str(e)}

    def place_market_order(
        self,
        token_id: str,
        side: str,
        amount_usd: float,
        worst_price: float = 0.0,
    ) -> dict:
        """
        Coloca uma ordem a mercado (FOK) assinada com EIP-712.
        
        Args:
            token_id: Token ID do outcome
            side: "BUY" ou "SELL"
            amount_usd: USD a gastar (BUY) ou shares a vender × price (SELL)
            worst_price: Pior preço aceitável (0 = qualquer)
        
        Returns:
            {"order_id": str, "status": str, "raw": dict}
        """
        if not self._clob_client:
            return {"order_id": None, "status": "error", "error": "ClobClient não disponível"}

        try:
            side_const = BUY if side.upper() == "BUY" else SELL

            logger.info(f"Market order (FOK): {side} ${amount_usd:.2f} "
                       f"| worst_price: {worst_price} | token: {token_id[:20]}...")

            market_args = MarketOrderArgs(
                token_id=token_id,
                amount=amount_usd,
                side=side_const,
                price=worst_price,
                order_type=OrderType.FOK,
            )

            order = self._clob_client.create_market_order(market_args)
            resp = self._clob_client.post_order(order, OrderType.FOK)
            logger.info(f"Market order resposta: {resp}")

            order_id = None
            status = "unknown"
            if isinstance(resp, dict):
                order_id = resp.get("orderID") or resp.get("order_id") or resp.get("id")
                status = resp.get("status", "unknown")
                if "errorMsg" in resp and resp["errorMsg"]:
                    status = f"error: {resp['errorMsg']}"

            return {"order_id": order_id, "status": status, "raw": resp}

        except Exception as e:
            logger.error(f"Erro ao colocar market order: {e}")
            return {"order_id": None, "status": "error", "error": str(e)}

    def cancel_order(self, order_id: str) -> dict:
        """Cancela uma ordem específica."""
        try:
            result = self._delete("/order", {"orderID": order_id})
            logger.info(f"Cancel {order_id}: {result}")
            success = "error" not in str(result).lower() or result.get("not_canceled") == []
            return {"success": success, "raw": result}
        except Exception as e:
            logger.error(f"Erro ao cancelar {order_id}: {e}")
            return {"success": False, "error": str(e)}

    def cancel_all_orders(self) -> dict:
        """Cancela todas as ordens abertas."""
        try:
            result = self._delete("/cancel-all")
            logger.info(f"Cancel all: {result}")
            return {"success": True, "raw": result}
        except Exception as e:
            logger.error(f"Erro ao cancelar tudo: {e}")
            return {"success": False, "error": str(e)}


# ------------------------------------------------------------------
# CLI rápido para testes
# ------------------------------------------------------------------
if __name__ == "__main__":
    import sys
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )

    trader = PolyTrader()

    cmd = sys.argv[1] if len(sys.argv) > 1 else "test"

    if cmd == "test":
        print("\n🔐 Testando conexão com Polymarket CLOB...")
        results = trader.test_connection()
        print(json.dumps(results, indent=2, default=str))

    elif cmd == "balance":
        bal = trader.get_balance()
        print(f"\n💰 Saldo: ${bal.get('balance_usdc', 0):.4f} USDC")
        print(json.dumps(bal, indent=2, default=str))

    elif cmd == "orders":
        orders = trader.get_open_orders()
        print(f"\n📋 Ordens abertas: {len(orders)}")
        for o in orders[:5]:
            print(f"  - {json.dumps(o, default=str)}")

    elif cmd == "trades":
        trades = trader.get_trades()
        print(f"\n📊 Últimos trades: {len(trades)}")
        for t in trades[:5]:
            print(f"  - {json.dumps(t, default=str)}")

    elif cmd == "cancel_all":
        result = trader.cancel_all_orders()
        print(f"\n🗑️  Cancelar tudo: {result}")

    else:
        print(f"Uso: python trader.py [test|balance|orders|trades|cancel_all]")
