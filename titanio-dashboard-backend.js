/**
 * TITANIO DASHBOARD BACKEND — REAL MODEL SWITCHING
 * Porta: 4444
 * Conecta ao OpenClaw via CLI para controlar modelos
 */

const express = require('express');
const { execSync } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4444;

app.use(cors());
app.use(express.json());

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// GET CURRENT MODEL (REAL, NOT FAKE)
// ============================================
app.get('/api/openclaw/model', (req, res) => {
  try {
    // Parse the actual openclaw models status output
    const output = execSync('openclaw models status 2>&1', {
      encoding: 'utf-8',
      timeout: 5000
    });
    
    // Extract "Default : anthropic/claude-opus-4-6"
    const defaultMatch = output.match(/Default\s*:\s*(.+)/);
    const defaultModel = defaultMatch ? defaultMatch[1].trim() : 'unknown';

    // Extract aliases
    const aliasesMatch = output.match(/Aliases.*?:\s*(.+)/);
    const aliasesStr = aliasesMatch ? aliasesMatch[1].trim() : '';
    
    // Parse "opus -> anthropic/claude-opus-4-6, sonnet -> ..."
    const aliases = {};
    if (aliasesStr) {
      aliasesStr.split(',').forEach(pair => {
        const [alias, model] = pair.trim().split('->').map(s => s.trim());
        if (alias && model) aliases[alias] = model;
      });
    }

    res.json({
      model: defaultModel,
      aliases,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get model',
      message: error.message
    });
  }
});

// ============================================
// SET MODEL (THE IMPORTANT ONE!)
// ============================================
app.post('/api/openclaw/model', (req, res) => {
  const { model, agent = 'main' } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'model parameter required' });
  }

  try {
    // Execute the real command
    const cmd = `openclaw models set ${model} --agent ${agent} 2>&1`;
    console.log(`[${new Date().toISOString()}] Executing: ${cmd}`);
    
    const output = execSync(cmd, {
      encoding: 'utf-8',
      timeout: 10000
    });

    // Verify it worked
    const verify = execSync('openclaw models status --json 2>&1', {
      encoding: 'utf-8',
      timeout: 5000
    });

    let verifyData;
    try {
      verifyData = JSON.parse(verify);
    } catch (e) {
      console.error('Verify parse failed:', e.message);
      verifyData = { error: 'parse_failed' };
    }

    res.json({
      success: true,
      requested: model,
      actual: verifyData.default?.id || verifyData.default?.model || 'unknown',
      message: output.split('\n').filter(l => l.trim()).slice(-1)[0],
      timestamp: new Date().toISOString()
    });

    console.log(`[${new Date().toISOString()}] Model set to: ${model}`);
  } catch (error) {
    console.error('Model set failed:', error.message);
    res.status(500).json({
      success: false,
      requested: model,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================
// LIST ALL AVAILABLE MODELS
// ============================================
app.get('/api/openclaw/models', (req, res) => {
  try {
    const output = execSync('openclaw models list --json 2>&1', {
      encoding: 'utf-8',
      timeout: 5000
    });

    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch (e) {
      return res.json({ models: [], error: 'parse_failed' });
    }

    res.json({
      models: (parsed.models || []).map(m => ({
        id: m.id,
        name: m.name || m.id,
        provider: m.provider || 'unknown'
      })),
      total: parsed.total || (parsed.models?.length || 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list models',
      message: error.message
    });
  }
});

// ============================================
// SQUAD STATUS (32 ESPECIALISTAS)
// ============================================
app.get('/api/squad', (req, res) => {
  // Simular 32 especialistas (pode vir de GitHub mais tarde)
  const squad = [
    { id: 'memory-bot', name: 'Memory Bot', status: 'active' },
    { id: 'ios-specialist', name: 'iOS Specialist', status: 'active' },
    { id: 'money-maker', name: 'Money Maker', status: 'active' },
    { id: 'agent-doctor', name: 'Agent Doctor', status: 'active' },
    { id: 'security-guardian', name: 'Security Guardian', status: 'active' },
    // ... mais 27 especialistas
  ];

  res.json({
    squad,
    total: 32,
    active: squad.length,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// HEALTH FULL (diagnostics)
// ============================================
app.get('/api/health/full', (req, res) => {
  try {
    const status = execSync('openclaw status 2>&1', { encoding: 'utf-8', timeout: 5000 });
    const cron = execSync('cron list --json 2>&1', { encoding: 'utf-8', timeout: 5000 }).slice(0, 500);
    
    res.json({
      gateway: status.includes('running') ? 'ok' : 'unknown',
      cron_jobs: cron.length > 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n🚀 TITANIO DASHBOARD BACKEND (REAL)`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /api/openclaw/model`);
  console.log(`  POST /api/openclaw/model      (SET MODEL!)`);
  console.log(`  GET  /api/openclaw/models`);
  console.log(`  GET  /api/squad`);
  console.log(`  GET  /api/health/full`);
  console.log(`\nTesting: curl -X POST http://localhost:4444/api/openclaw/model -H "Content-Type: application/json" -d '{"model":"opus"}'\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});
