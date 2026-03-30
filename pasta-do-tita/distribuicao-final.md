# Distribuição Final — Titanio Dashboard
**Data:** 2026-03-13

## Status: ✅ COMPLETO

---

## titanio-helber/
```
titanio-helber/
├── START.sh          ✅ (backend porta 4445, frontend porta 3001)
├── STOP.sh           ✅
├── LEIA-ME.md        ✅
└── code/
    ├── backend/
    │   ├── .env      ✅ (PORT=4445, OWNER_ID=helber)
    │   ├── src/      ✅ (sincronizado)
    │   └── dist/     ✅
    └── frontend/
        ├── app/      ✅ (sincronizado)
        ├── components/ ✅ (sincronizado)
        └── public/
            └── specialists/ ✅ (8 imagens)
```

### .env Helber
- PORT=4445
- NODE_ENV=production
- OWNER_ID=helber / OWNER_NAME=Helber
- GATEWAY_HOST=192.168.18.174 / GATEWAY_PORT=18789
- JWT_SECRET=helber-titanio-2026

---

## titanio-tiago/
```
titanio-tiago/
├── START.sh          ✅ (backend porta 4446, frontend porta 3002)
├── STOP.sh           ✅
├── LEIA-ME.md        ✅
└── code/
    ├── backend/
    │   ├── .env      ✅ (PORT=4446, OWNER_ID=tiago)
    │   ├── src/      ✅ (sincronizado)
    │   └── dist/     ✅
    └── frontend/
        ├── app/      ✅ (sincronizado)
        ├── components/ ✅ (sincronizado)
        └── public/
            └── specialists/ ✅ (8 imagens)
```

### .env Tiago
- PORT=4446
- NODE_ENV=production
- OWNER_ID=tiago / OWNER_NAME=Tiago
- GATEWAY_HOST=192.168.18.174 / GATEWAY_PORT=18789
- JWT_SECRET=tiago-titanio-2026

---

## Checklist Final
- [x] START.sh criado para Helber (portas 3001/4445)
- [x] STOP.sh criado para Helber
- [x] LEIA-ME.md criado para Helber
- [x] START.sh criado para Tiago (portas 3002/4446)
- [x] STOP.sh criado para Tiago
- [x] LEIA-ME.md criado para Tiago
- [x] Arquivos frontend sincronizados (components, app)
- [x] Backend sincronizado (index.ts, services)
- [x] Specialists images: 8 imagens em cada distribuição
- [x] .env Helber: atualizado com vars corretas
- [x] .env Tiago: atualizado com vars corretas

## Fonte dos arquivos sincronizados
`/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/code`
