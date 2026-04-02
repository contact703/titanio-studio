/**
 * PM2 Ecosystem Config — Titanio Mac Mini M4
 * Gerado em: 2026-04-02
 * 
 * ATENÇÃO: OpenClaw Gateway, PostgreSQL e Redis NÃO estão aqui
 * porque já são gerenciados por LaunchAgent/Homebrew services.
 * PM2 monitora e gerencia apenas os processos sem gerenciador.
 * 
 * Para iniciar: pm2 start ecosystem.config.js
 * Para salvar: pm2 save
 * Para startup: pm2 startup (executar o comando que imprimir)
 */

const BASE_LOG = '/Volumes/TITA_039/MAC_MINI_03/logs/titanio';
const WORKSPACE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace';
const POLYMARKET_DIR = `${WORKSPACE}/pasta-do-tita/projetos/polymarket-agent`;
const POLYMARKET_OLD_DIR = `${WORKSPACE}/projetos/polymarket-agent`;
const DASHBOARD_DIR = `${WORKSPACE}/pasta-do-tita/projetos/titanio-dashboard/code`;
const PYTHON_BIN = `${POLYMARKET_DIR}/venv/bin/python3`;

module.exports = {
  apps: [

    // ═══════════════════════════════════════════════════════════════
    // N8N — Workflow Automation (porta 5678)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'n8n',
      script: '/usr/local/bin/node',
      args: '/usr/local/bin/n8n start --insecure',
      cwd: '/Volumes/TITA_039/MAC_MINI_03',
      interpreter: 'none',
      env: {
        N8N_USER_FOLDER: '/Volumes/TITA_039/MAC_MINI_03/.n8n',
        N8N_LOG_LEVEL: 'info',
        N8N_LOG_OUTPUT: 'file',
        N8N_LOG_FILE_LOCATION: `${BASE_LOG}/n8n.log`,
        PATH: '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin',
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
      },
      max_memory_restart: '800M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 10000,
      watch: false,
      output: `${BASE_LOG}/n8n-out.log`,
      error: `${BASE_LOG}/n8n-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ═══════════════════════════════════════════════════════════════
    // DASHBOARD BACKEND — API Server Titanio (porta 4444)
    // Roda em modo DEV (tsx watch) — para produção usar build
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'dashboard-backend',
      script: `${DASHBOARD_DIR}/node_modules/.bin/tsx`,
      args: 'watch src/index.ts',
      cwd: `${DASHBOARD_DIR}/backend`,
      env: {
        NODE_ENV: 'development',
        PORT: '4444',
        PATH: '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin',
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
      },
      max_memory_restart: '500M',
      autorestart: true,
      max_restarts: 15,
      min_uptime: '20s',
      restart_delay: 5000,
      watch: false,
      output: `${BASE_LOG}/dashboard-backend-out.log`,
      error: `${BASE_LOG}/dashboard-backend-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ═══════════════════════════════════════════════════════════════
    // DASHBOARD FRONTEND — Next.js (porta 3000)
    // Roda em modo DEV — para produção: build + next start
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'dashboard-frontend',
      script: `${DASHBOARD_DIR}/node_modules/.bin/next`,
      args: 'dev',
      cwd: `${DASHBOARD_DIR}/frontend`,
      env: {
        NODE_ENV: 'development',
        PORT: '3000',
        PATH: '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin',
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
      },
      max_memory_restart: '600M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '30s',
      restart_delay: 8000,
      watch: false,
      output: `${BASE_LOG}/dashboard-frontend-out.log`,
      error: `${BASE_LOG}/dashboard-frontend-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ═══════════════════════════════════════════════════════════════
    // AUTO_TRADER — Polymarket Trading Bot
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'auto-trader',
      script: 'src/auto_trader.py',
      interpreter: PYTHON_BIN,
      cwd: POLYMARKET_DIR,
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: POLYMARKET_DIR,
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
      },
      max_memory_restart: '400M',
      autorestart: true,
      max_restarts: 5,
      min_uptime: '30s',
      restart_delay: 15000, // 15s — não spammar Polymarket
      watch: false,
      output: `${BASE_LOG}/auto-trader-out.log`,
      error: `${BASE_LOG}/auto-trader-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ═══════════════════════════════════════════════════════════════
    // MONITOR.PY — Polymarket Monitor
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'polymarket-monitor',
      script: 'src/monitor.py',
      interpreter: PYTHON_BIN,
      cwd: POLYMARKET_DIR,
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: POLYMARKET_DIR,
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
      },
      max_memory_restart: '300M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '20s',
      restart_delay: 10000,
      watch: false,
      output: `${BASE_LOG}/polymarket-monitor-out.log`,
      error: `${BASE_LOG}/polymarket-monitor-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ═══════════════════════════════════════════════════════════════
    // DASHBOARD-SERVER.PY — Dashboard Polymarket (dir antigo)
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'polymarket-dashboard-server',
      script: 'dashboard-server.py',
      interpreter: `${POLYMARKET_OLD_DIR}/venv/bin/python3`,  // venv do dir antigo tem flask
      cwd: POLYMARKET_OLD_DIR,
      env: {
        PYTHONUNBUFFERED: '1',
        PYTHONPATH: POLYMARKET_OLD_DIR,
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
      },
      max_memory_restart: '200M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '20s',
      restart_delay: 5000,
      watch: false,
      output: `${BASE_LOG}/polymarket-dashboard-out.log`,
      error: `${BASE_LOG}/polymarket-dashboard-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

    // ═══════════════════════════════════════════════════════════════
    // MEMORY WATCHDOG — Tita Memory System
    // ═══════════════════════════════════════════════════════════════
    {
      name: 'memory-watchdog',
      script: `${WORKSPACE}/memory-watchdog.sh`,
      interpreter: '/bin/bash',
      cwd: WORKSPACE,
      env: {
        HOME: '/Volumes/TITA_039/MAC_MINI_03',
        PATH: '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin',
      },
      max_memory_restart: '100M',
      autorestart: true,
      max_restarts: 20,
      min_uptime: '60s',
      restart_delay: 5000,
      watch: false,
      output: `${BASE_LOG}/memory-watchdog-out.log`,
      error: `${BASE_LOG}/memory-watchdog-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },

  ],

  /**
   * SERVIÇOS NÃO INCLUÍDOS AQUI (gerenciados por outros sistemas):
   * - openclaw-gateway (LaunchAgent: ai.openclaw.gateway) → porta 18789
   * - postgresql       (LaunchAgent: homebrew.mxcl.postgresql@15) → porta 5432
   * - redis            (LaunchAgent: homebrew.mxcl.redis) → porta 6379
   * - ollama           (App macOS: Ollama.app) → porta 11434
   * - caffeinate       (LaunchAgent: com.openclaw.caffeinate) → já gerenciado
   */

};
