# 🚀 PRÓXIMOS PASSOS — PRONTO PARA EXECUTAR

**Data:** 2026-03-22 19:20 BRT  
**Status:** Tudo documentado, scripts testados, pronto para integração

---

## 1️⃣ INTEGRAR REAL-LEARNING NO BACKEND (15 min)

**Arquivo:** `pasta-do-tita/projetos/titanio-dashboard/code/backend/src/routes/specialists.ts`

**O que fazer:**

1. Localizar endpoint `POST /api/squad/:id/task/complete`
2. Adicionar hook ANTES do response:

```typescript
// code/backend/src/routes/specialists.ts

app.post('/api/squad/:id/task/complete', async (req, res) => {
    const { id } = req.params;
    const { taskId, result, learning } = req.body;
    
    // ... salvar resultado da tarefa ...
    
    // [NEW] REAL-LEARNING HOOK
    if (learning) {
        const { execSync } = require('child_process');
        try {
            execSync(`bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-specialist-learned "${id}" "${taskId}" "${learning}"`);
        } catch (e) {
            console.error('Learning capture failed:', e.message);
            // Não bloqueia a resposta se falhar
        }
    }
    
    // Responder com sucesso
    res.json({ 
        success: true, 
        taskId,
        learningCaptured: !!learning
    });
});
```

**Tempo:** 15 minutos (copiar, colar, testar)

---

## 2️⃣ INTEGRAR MEMORY-LOADER NO FRONTEND (10 min)

**Arquivo:** `pasta-do-tita/projetos/titanio-dashboard/code/frontend/src/pages/specialist.tsx`

**O que fazer:**

1. Quando usuário clica em especialista para executar tarefa
2. Chamar endpoint novo: `GET /api/squad/:id/memory`
3. Mostrar na UI: "Conhecimento anterior: ..." (opcional visual)

```typescript
// GET endpoint no backend (add isso em specialists.ts)
app.get('/api/squad/:id/memory', async (req, res) => {
    const { id } = req.params;
    const { execSync } = require('child_process');
    
    try {
        const memory = execSync(`bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-specialist-memory-loader "${id}"`).toString();
        res.json({ memory });
    } catch (e) {
        res.json({ memory: 'Nenhuma memória anterior' });
    }
});

// Frontend (integrar no contexto da tarefa)
const memory = await fetch(`/api/squad/${specialistId}/memory`).then(r => r.json());
const taskContext = `${memory.memory}\n\nTarefa: ${taskDescription}`;
```

**Tempo:** 10 minutos

---

## 3️⃣ INTEGRAR TITA-SCRAPER NO DASHBOARD (5 min)

**Arquivo:** `pasta-do-tita/projetos/titanio-dashboard/code/backend/src/routes/tools.ts` (novo)

**O que fazer:**

```typescript
// Novo endpoint: POST /api/tools/scrape

app.post('/api/tools/scrape', async (req, res) => {
    const { url, selector } = req.body;
    const { spawn } = require('child_process');
    
    const proc = spawn('python3', [
        '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-scraper',
        url,
        ...(selector ? ['--selector', selector] : [])
    ]);
    
    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    
    proc.on('close', (code) => {
        if (code === 0) {
            try {
                const result = JSON.parse(output);
                res.json({ success: true, data: result });
            } catch (e) {
                res.json({ success: false, error: 'Parse error' });
            }
        } else {
            res.json({ success: false, error: 'Scraper failed' });
        }
    });
});
```

**Tempo:** 5 minutos (copiar endpoint, testar via curl)

---

## 4️⃣ CRIAR UI PARA TESTAR TUDO (20 min)

**Nova página:** `pasta-do-tita/projetos/titanio-dashboard/code/frontend/src/pages/tools.tsx`

**O que mostrar:**

1. Input URL
2. Input selector (opcional)
3. Botão "Scrape"
4. Resultado (JSON)
5. Stats (tempo, bytes, sucesso)

**Componente básico:**

```typescript
import React, { useState } from 'react';

export default function ToolsPage() {
    const [url, setUrl] = useState('');
    const [selector, setSelector] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleScrape = async () => {
        setLoading(true);
        const res = await fetch('/api/tools/scrape', {
            method: 'POST',
            body: JSON.stringify({ url, selector: selector || null })
        });
        setResult(await res.json());
        setLoading(false);
    };
    
    return (
        <div className="p-6">
            <h1>Tita Scraper</h1>
            <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" />
            <input value={selector} onChange={e => setSelector(e.target.value)} placeholder="Selector (opcional)" />
            <button onClick={handleScrape} disabled={loading}>
                {loading ? 'Scraping...' : 'Scrape'}
            </button>
            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
    );
}
```

**Tempo:** 20 minutos (UI básica, pode melhorar depois)

---

## 5️⃣ TESTAR TUDO JUNTO (10 min)

**Checklist:**

- [ ] Backend rodando (`npm start` em code/backend/)
- [ ] Frontend rodando (`npm start` em code/frontend/)
- [ ] Fazer tarefa com especialista → vê "learning captured: true"
- [ ] Próxima tarefa do mesmo especialista → vê conhecimento anterior na memória
- [ ] Testar Scraper em URL qualquer (ex: `https://example.com`)
- [ ] Verificar se memory.json foi atualizado (`ls -lh memoria-especialistas/*/memory.json`)

**Tempo:** 10 minutos

---

## 📋 CHECKLIST FINAL

- [ ] Real-learning integrado no backend
- [ ] Memory-loader integrado no backend + frontend
- [ ] Scraper integrado como endpoint
- [ ] UI para scraper criada
- [ ] Tudo testado e funcionando
- [ ] Memory files atualizados após testes

---

## 🎯 RESULTADO ESPERADO

**Depois de completar:**

1. ✅ Especialistas aprendem automaticamente
2. ✅ Próxima tarefa usa contexto anterior
3. ✅ Scraper funciona via Dashboard
4. ✅ Tudo pronto pra Zica testar amanhã

**Tempo total:** ~60 minutos (1h)

**Próximo:** Aguardar Zica validar amanhã

---

**Status:** 🟢 Pronto para começar. Nenhuma dependência bloqueadora.

