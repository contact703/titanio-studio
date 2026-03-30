# 🔧 Fix Dashboard Titanio — Portas Offline

**Problema:** Backend (:4446), Frontend (:3002) e HEARTBEAT (:4444/:3001) offline.

## Diagnóstico Rápido

```bash
# 1. Verificar se os processos estão rodando
lsof -i :4446 && lsof -i :3002 && lsof -i :3001

# 2. Verificar portas ocupadas
netstat -an | grep -E "4446|3002|3001|4444"

# 3. Verificar logs de erro
tail -50 /tmp/titanio-backend.log 2>/dev/null
tail -50 /tmp/titanio-frontend.log 2>/dev/null
```

## Fix Passo a Passo

### 1. Matar processos órfãos
```bash
pkill -f "node.*4446" 2>/dev/null
pkill -f "node.*3002" 2>/dev/null
pkill -f "node.*3001" 2>/dev/null
pkill -f "titanio" 2>/dev/null
sleep 2
```

### 2. Reiniciar Backend (:4446)
```bash
cd ~/titanio-backend  # ou onde estiver o backend
npm run dev &
# ou: node server.js &
```

### 3. Reiniciar Frontend (:3002)
```bash
cd ~/titanio-frontend  # ou onde estiver o frontend
npm run dev &
# ou: npm start &
```

### 4. Verificar HEARTBEAT (:3001/:4444)
```bash
# Se tiver um healthcheck separado:
cd ~/titanio-health && npm start &

# Ou verificar se está no backend:
curl -s http://localhost:4446/health || echo "Backend não respondeu"
```

### 5. Testar tudo
```bash
curl -s http://localhost:4446/health && echo "✅ Backend OK" || echo "❌ Backend FAIL"
curl -s http://localhost:3002 && echo "✅ Frontend OK" || echo "❌ Frontend FAIL"
curl -s http://localhost:3001/health && echo "✅ Heartbeat OK" || echo "❌ Heartbeat FAIL"
```

## Se Ainda Não Funcionar

1. **Verificar Node instalado:** `node -v && npm -v`
2. **Verificar dependências:** `cd ~/titanio-backend && npm install`
3. **Verificar .env:** confirmar que as variáveis de ambiente estão corretas
4. **Firewall:** `sudo ufw status` — se ativo, liberar portas

## Automação (rodar tudo de uma vez)

```bash
#!/bin/bash
# fix-dashboard.sh
pkill -f "node.*4446" 2>/dev/null
pkill -f "node.*3002" 2>/dev/null
sleep 2

cd ~/titanio-backend && nohup npm run dev > /tmp/titanio-backend.log 2>&1 &
cd ~/titanio-frontend && nohup npm run dev > /tmp/titanio-frontend.log 2>&1 &

sleep 5
echo "Status:"
curl -s http://localhost:4446/health && echo " ✅ Backend" || echo " ❌ Backend"
curl -s http://localhost:3002 > /dev/null && echo " ✅ Frontend" || echo " ❌ Frontend"
```

---
*Gerado por Tita 🐾 para o Claw do Tiago*
