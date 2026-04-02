// ecosystem.config.js — Titanio Dashboard Production
// PM2 gerencia TODOS os serviços Node.js
// PostgreSQL, Redis e Ollama ficam via brew services

const DASH = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code';
const WORKSPACE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace';

module.exports = {
  apps: [
    // === CORE: Dashboard Backend (PRODUÇÃO) ===
    {
      name: 'dashboard-backend',
      cwd: `${DASH}/backend`,
      script: 'node',
      args: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: '4444',
      },
      max_memory_restart: '300M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/backend-error.log`,
      out_file: `${WORKSPACE}/logs/backend-out.log`,
      merge_logs: true,
    },

    // === CORE: Dashboard Frontend (PRODUÇÃO) ===
    {
      name: 'dashboard-frontend',
      cwd: `${DASH}`,
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      max_memory_restart: '200M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/frontend-error.log`,
      out_file: `${WORKSPACE}/logs/frontend-out.log`,
      merge_logs: true,
    },

    // === CORE: N8n Automação ===
    {
      name: 'n8n',
      script: 'n8n',
      args: 'start',
      env: {
        N8N_PORT: '5678',
        N8N_PROTOCOL: 'http',
        NODE_ENV: 'production',
      },
      max_memory_restart: '400M',
      restart_delay: 5000,
      max_restarts: 5,
      min_uptime: '15s',
      kill_timeout: 10000,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/n8n-error.log`,
      out_file: `${WORKSPACE}/logs/n8n-out.log`,
      merge_logs: true,
    },

    // === UTIL: Memory Watchdog ===
    {
      name: 'memory-watchdog',
      script: 'bash',
      args: `${WORKSPACE}/bin/memory-watchdog.sh`,
      max_memory_restart: '50M',
      restart_delay: 10000,
      max_restarts: 100,
      autorestart: true,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/watchdog-error.log`,
      out_file: `${WORKSPACE}/logs/watchdog-out.log`,
      merge_logs: true,
    },

    // === POLYMARKET ===
    {
      name: 'auto-trader',
      cwd: `${WORKSPACE}/projetos/polymarket-agent`,
      script: 'node',
      args: 'smart-trader-v2.js',
      max_memory_restart: '100M',
      restart_delay: 60000,
      max_restarts: 5,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/trader-error.log`,
      out_file: `${WORKSPACE}/logs/trader-out.log`,
      merge_logs: true,
    },

    {
      name: 'polymarket-monitor',
      cwd: `${WORKSPACE}/projetos/polymarket-agent`,
      script: 'node',
      args: 'monitor.js',
      max_memory_restart: '150M',
      restart_delay: 30000,
      max_restarts: 5,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/poly-monitor-error.log`,
      out_file: `${WORKSPACE}/logs/poly-monitor-out.log`,
      merge_logs: true,
    },

    {
      name: 'polymarket-dashboard-server',
      cwd: `${WORKSPACE}/projetos/polymarket-agent`,
      script: 'node',
      args: 'dashboard-server.js',
      max_memory_restart: '50M',
      restart_delay: 5000,
      max_restarts: 5,
      watch: false,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: `${WORKSPACE}/logs/poly-dash-error.log`,
      out_file: `${WORKSPACE}/logs/poly-dash-out.log`,
      merge_logs: true,
    },
  ],
};
