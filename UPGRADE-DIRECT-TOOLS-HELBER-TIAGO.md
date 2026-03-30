# ⚡ Titanio Direct Tools — MCP → Tool Calls Diretas

> **Para:** Claw do Helber e Claw do Tiago
> **Data:** 30/03/2026
> **Inspirado em:** @agentic.james (MCP servers desperdiçam tokens)

---

## O QUE É

Em vez de usar MCP servers (que gastam tokens negociando protocolo), chamamos ferramentas DIRETO via Python. Zero overhead.

**12 tools prontas:**
- `memory_search` — Busca semântica na memória
- `memory_curate` — Guarda conhecimento
- `memory_recall` — Contexto últimos 3 dias
- `system_health` — Status dos serviços
- `system_squad` — Lista especialistas
- `system_tasks` — Tasks HiClaw
- `media_banner` — Gera banner
- `media_gallery` — Lista outputs
- `delegate_task` — Delega pra especialista
- `instagram_post` — Posta no Instagram
- `polymarket_portfolio` — Portfolio Polymarket
- `security_scan` — Scan segurança

---

## INSTALAR

```bash
scp contacttitanio@192.168.18.174:bin/titanio-direct-tools.py ~/workspace/bin/
chmod +x ~/workspace/bin/titanio-direct-tools.py
# Ajustar WORKSPACE path no script
```

## USAR

```bash
# Listar tools
python3 bin/titanio-direct-tools.py list

# Chamar direto
python3 bin/titanio-direct-tools.py system_health
python3 bin/titanio-direct-tools.py memory_search "polymarket"
python3 bin/titanio-direct-tools.py delegate_task "titulo" "code-ninja" "descrição"
```

## POR QUE

MCP: `negotiate → list tools → select → call → parse → respond` (muitos tokens)
Direct: `chama função → resultado` (zero overhead)

Com Claude apertando session limits, cada token economizado = dinheiro.
