# Mapa da Rede Titanio — 192.168.18.0/24

Descoberto em: 2026-03-14

## Dispositivos Ativos

| IP | MAC | Tipo | SSH | Serviços |
|----|-----|------|-----|----------|
| 192.168.18.1 | a0:31:db:72:02:7e | Router/Gateway | ? | - |
| 192.168.18.11 | e0:22:a1:a1:ca:bd | Desconhecido | ? | - |
| 192.168.18.13 | 30:24:a9:6f:c9:ae | Desconhecido | ? | - |
| 192.168.18.169 | **d0:11:e5:70:04:fb** | **Apple Mac** | ❌ | - |
| **192.168.18.170** | **d0:11:e5:26:03:62** | **Apple Mac** | ✅ | SSH:22 |
| **192.168.18.174** | **d0:11:e5:dc:37:20** | **Apple Mac (ESTE)** | ✅ | SSH:22, Dashboard:3000, Backend:4444, N8n:5678, OpenClaw:18789 |
| 192.168.18.188 | **d0:11:e5:e8:8b:c7** | **Apple Mac** | ❌ | - |
| 192.168.18.147 | 92:a1:33:8e:11:d2 | Desconhecido | ? | - |
| 192.168.18.159 | e2:aa:bd:87:2d:17 | Desconhecido | ? | - |
| 192.168.18.165 | 52:7b:12:c3:3c:51 | Desconhecido | ? | - |
| 192.168.18.208 | 76:9d:3a:f5:5f:60 | Desconhecido | ? | - |
| 192.168.18.227 | b0:e4:5c:5e:8d:a2 | Desconhecido | ? | - |

## Apple Macs Identificados (prefixo d0:11:e5 = Apple Inc)
- **.169** — Mac, SSH fechado (Helber ou Tiago?)
- **.170** — Mac, SSH aberto mas sem credenciais ainda
- **.174** — ESTE Mac (Mac Mini 03 do Eduardo/Tita)
- **.188** — Mac, SSH fechado (Helber ou Tiago?)

## Para Deploy nos outros Macs
1. Precisamos de: usuário + senha do Mac remoto
2. Ou: acesso físico para ativar "Sessão Remota" nas Preferências
3. Script pronto: `tita-learning-system/deploy-dashboard.sh <IP> <usuario>`
4. Após primeiro acesso: `tita-learning-system/setup-ssh-keys.sh <IP> <usuario>`
