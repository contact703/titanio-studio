# Memory API Endpoints — Titanio Dashboard (porta 4444)

Endpoints que o backend precisa implementar para o sistema de memória funcionar.

## Implementação mínima (Node.js/Express)

```typescript
import fs from 'fs/promises';
import path from 'path';

const WORKSPACE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace';

// POST /api/memory/append
// Body: { file: string, content: string }
app.post('/api/memory/append', async (req, res) => {
  const { file, content } = req.body;
  const filePath = path.join(WORKSPACE, file);
  
  // Criar arquivo se não existir
  try { await fs.access(filePath); }
  catch { await fs.writeFile(filePath, `# ${path.basename(file, '.md')}\n`); }
  
  await fs.appendFile(filePath, '\n' + content);
  res.json({ ok: true, file });
});

// GET /api/memory/weekly-notes
// Query: { days: number }
app.get('/api/memory/weekly-notes', async (req, res) => {
  const days = parseInt(req.query.days || '7');
  const notes = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(Date.now() - i * 86400000)
      .toISOString().split('T')[0];
    const filePath = path.join(WORKSPACE, 'memory', `${date}.md`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      notes.push({ date, content });
    } catch { /* arquivo não existe, pular */ }
  }
  
  res.json({ notes, days });
});

// POST /api/memory/sync-record
// Body: { synced_at, latest_sha, new_commits, workflow }
app.post('/api/memory/sync-record', async (req, res) => {
  const record = { ...req.body, recorded_at: new Date().toISOString() };
  const filePath = path.join(WORKSPACE, 'memory', 'sync-state.json');
  await fs.writeFile(filePath, JSON.stringify(record, null, 2));
  res.json({ ok: true });
});

// GET /api/memory/last-sync
app.get('/api/memory/last-sync', async (req, res) => {
  try {
    const filePath = path.join(WORKSPACE, 'memory', 'sync-state.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    res.json({ last_sync_at: data.synced_at, ...data });
  } catch {
    res.json({ last_sync_at: null });
  }
});
```

## Endpoints já esperados pelos outros workflows

| Endpoint | Método | Usado por |
|----------|--------|-----------|
| `/api/bots` | GET | WF-001 relatório diário |
| `/api/reports` | GET | WF-002 daily report |
| `/api/events/log` | POST | todos os workflows |
| `/api/message/send` | POST | (substituído por /api/message direto ao OpenClaw) |
| `/api/memory/append` | POST | WF-010, WF-011 |
| `/api/memory/weekly-notes` | GET | WF-011 |
| `/api/memory/sync-record` | POST | WF-003 |
| `/api/memory/last-sync` | GET | WF-003 |
