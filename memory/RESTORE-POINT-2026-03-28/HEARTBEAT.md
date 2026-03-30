# HEARTBEAT.md

## Primeiro (SEMPRE)
- [ ] Verificar se Tita Memory Watchdog está rodando: `pgrep -f memory-watchdog.sh`
- [ ] Se não estiver: `bash /tmp/start-tita-memory-watchdog.sh`

## AUTO-MEMORY SYSTEM (Rodando 24/7)

**Watchdog ativo:** Sim  
**Status:** Memory-watchdog.sh (PID via pgrep)  
**Consolidação:** 23:59 BRT automático  
**Teste semanal:** Domingo 09:00 automático  
**Logs:** /tmp/tita-memory-watchdog.log

O sistema funciona continuamente. Não precisa de ação manual.

## Backups Disponíveis
- Projetos: `/Volumes/TITA_039/backup-projetos/`
- Apps: `/Volumes/TITA_039/Titanio-Backup-2026/apps/`
- KidsHQ: `/Volumes/TITA_039/backup-projetos/KidsHQ/`

## Checks do Sistema
- [ ] Verify caffeinate is running (`pgrep -x caffeinate`). If not, restart: `nohup caffeinate -dims &>/dev/null &`
- [ ] Check RAM: if free pages < 50000, log warning to memory
- [ ] Check watchdog.sh is running (`pgrep -f watchdog.sh`). If not, restart it.
- [x] Check memory-watchdog.sh is running (`pgrep -f memory-watchdog.sh`)

## Tita Learning System
- [x] Memory-watchdog roda continuamente
- [x] Consolidação automática (23:59)
- [x] Teste semanal automático (domingo 09:00)

## Consolidação Semanal de Memória
- [x] Automática via memory-watchdog (não precisa manual)
- [x] MEMORY.md sincronizado todo dia 23:59

## Security Guardian — Auditoria Semanal
- [ ] Segunda-feira: bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/security-weekly.sh
- [ ] Checar: credenciais em plaintext, API keys expostas, watchdogs ativos

## Victor Capital — Relatório Semanal de Editais
- [ ] Todo sábado: Victor Capital roda busca de editais abertos (Brasil + Internacional)
- [ ] Gerar relatório semanal em `/projetos/fundos/relatorio-semanal-YYYY-MM-DD.md`
- [ ] Enviar resumo das melhores oportunidades no WhatsApp


## 🆕 Real-Learning + Scraper (22/03)
- [x] TITA-SCRAPER criado (`/bin/tita-scraper`)
- [x] REAL-LEARNING-SYSTEM para especialistas funcionando
- [x] Scripts de aprendizado criados e testados
- [x] Memory-watchdog rodando 24/7 (PID 24022)
- [ ] **TODO:** Integrar real-learning no backend (15 min)
- [ ] **TODO:** Integrar scraper como endpoint (10 min)
- [ ] **TODO:** Testar tudo junto (10 min)
- [ ] Dashboard pronto para Zica testar 23/03
- [ ] Consolidação de especialistas (24/03 09:00)

