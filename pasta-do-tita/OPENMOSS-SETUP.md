# OpenMOSS + N8n — Setup para Tradução de Livros

**Status:** 🟡 Aguardando workflow de Zica  
**Data:** 2026-03-21 00:34 BRT  
**Objetivo:** Testar tradução autônoma com correções por 1 semana

---

## 📋 Checklist de Preparação

- [x] Pesquisar OpenMOSS (gratuito ✅)
- [x] Documentar setup esperado
- [ ] **Zica envia workflow de tradução**
- [ ] Verificar integração OpenMOSS ↔ N8n
- [ ] Criar sandbox/test node no N8n
- [ ] Configurar guardrails (budget, timeout, validação)
- [ ] Monitorar execução por 7 dias
- [ ] Gerar relatório (custos, erros, insights)

---

## 🔧 Ambiente Pronto

**Máquina:** Mac Mini (TITA_039)  
**N8n:** ✅ Rodando em `http://localhost:5678`  
**Backend:** ✅ Rodando em `http://localhost:4444`  
**Watchdog:** ✅ Monitorando tudo

**Capacidade Disponível:**
- RAM: 40.5k páginas livres ✅
- Storage: `/Volumes/TITA_039` com espaço ✅
- GPU: Não necessário pra tradução

---

## 🎯 Fluxo Esperado

```
1. Você manda workflow N8n (JSON)
2. Eu importo em http://localhost:5678
3. Configuro OpenMOSS nele (se necessário)
4. Ativamos "Autonomous Mode" (se OpenMOSS suportar)
5. Deixamos rodar 7 dias em sandbox
6. Monitora: custos, erros, performance
7. Relatório final: vale a pena escalar?
```

---

## 📊 Monitoramento

Vou criar dashboard com:
- **Execuções:** quantidade, duração média, taxa de erro
- **Custos:** tokens usados, valor estimado
- **Logs:** falhas, reprocessamento, alertas
- **Qualidade:** sample das traduções (amostra manual)

Arquivo: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/openmoss-monitoring.json`

---

## ⚙️ Guardrails Configurados

Para evitar desperdícios:

1. **Budget diário:** Monitorar (será definido após 1ª execução)
2. **Timeout:** 5 min por livro (evita loops)
3. **Validação:** Checksum MD5 pré/pós tradução
4. **Rollback:** Se taxa erro > 10%, pausar automático
5. **Alerts:** Avisar Zica + Eduardo se custo 2x acima do esperado

---

## 📁 Estrutura de Pastas

```
/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/
├── pasta-do-tita/
│   ├── OPENMOSS-SETUP.md ← você tá aqui
│   ├── openmoss-monitoring.json
│   ├── openmoss-workflow.json (quando Zica mandar)
│   └── openmoss-results/
│       ├── 2026-03-21_execucao-1.log
│       ├── 2026-03-21_execucao-1-sample.txt
│       └── ...
```

---

## 🚀 Próximo Passo

**Zica:** Enviar workflow N8n para tradução  
**Formato esperado:** JSON exportado do N8n (File → Download)

```json
{
  "name": "Tradução de Livro",
  "nodes": [ ... ],
  "connections": { ... }
}
```

Assim que receber, vou:
1. Importar no N8n
2. Testar 1 execução manual
3. Confirmar que OpenMOSS tá integrado
4. Ativar modo autônomo
5. Avisar quando tiver pronto

---

## 📞 Contato

- **Zica:** +553198777889 (grupo Gospia)
- **Eduardo:** +553183838181
- **Monitoramento:** Você vê em tempo real no Dashboard (http://localhost:4444)

---

**Último update:** 2026-03-21 00:34  
**Próximo:** Aguardando workflow
