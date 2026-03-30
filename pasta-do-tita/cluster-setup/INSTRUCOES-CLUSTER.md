# 🔗 Cluster Mac Mini — Instruções

## Status Atual
- **Gateway (Eduardo):** 192.168.18.174 — ✅ aberto pra LAN
- **Helber:** 192.168.18.170 — 🟡 online, precisa instalar node
- **Tiago:** 192.168.18.188 — 🟡 online, precisa instalar node

## Para Helber e Tiago

### Opção 1: Script automático (mais fácil)
```bash
# Copiar do Mac do Eduardo via rede:
scp contacttitanio@192.168.18.174:/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/cluster-setup/setup-node.sh ~/
bash ~/setup-node.sh
```

### Opção 2: Manual (3 comandos)
```bash
# 1. Instalar OpenClaw
npm install -g openclaw

# 2. Definir token (Eduardo fornece)
export OPENCLAW_GATEWAY_TOKEN="<token>"

# 3. Conectar ao gateway do Eduardo
openclaw node run --host 192.168.18.174 --port 18789 --display-name "Mac do Helber"
```

## Para Eduardo (aprovar nodes)
```bash
# Ver nodes pendentes
openclaw devices list

# Aprovar
openclaw devices approve <requestId>

# Verificar cluster
openclaw nodes status
```

## O que o cluster permite
- Executar comandos em qualquer Mac do cluster
- Se um Mac tá com pouca RAM, roda no outro
- Cada Mac pode ter agentes diferentes
- Browser proxy em cada node
- Execução paralela distribuída
