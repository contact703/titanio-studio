import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Trash2, Filter } from 'lucide-react';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({ level: '', node: '', agent: '' });
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  async function fetchLogs() {
    try {
      const params = new URLSearchParams();
      if (filter.level) params.append('level', filter.level);
      if (filter.node) params.append('nodeId', filter.node);
      if (filter.agent) params.append('agentId', filter.agent);
      params.append('limit', '500');

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }

  function clearLogs() {
    setLogs([]);
  }

  function exportLogs() {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
  }

  return (
    <div className="logs-page">
      <header className="page-header">
        <h1><Terminal size={20} /> Logs & Console</h1>
        <div className="header-actions">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={autoScroll}
              onChange={e => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <button className="btn" onClick={exportLogs}>
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-danger" onClick={clearLogs}>
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="filter-row">
          <select 
            value={filter.level} 
            onChange={e => setFilter(f => ({ ...f, level: e.target.value }))}
          >
            <option value="">All Levels</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>

          <input 
            type="text"
            placeholder="Filter by node..."
            value={filter.node}
            onChange={e => setFilter(f => ({ ...f, node: e.target.value }))}
          />

          <input 
            type="text"
            placeholder="Filter by agent..."
            value={filter.agent}
            onChange={e => setFilter(f => ({ ...f, agent: e.target.value }))}
          />

          <button className="btn" onClick={() => setFilter({ level: '', node: '', agent: '' })}>
            <Filter size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="logs-container" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {logs.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '3rem' }}>
            No logs found
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="log-entry">
              <span className="log-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="log-node" title={log.nodeId}>
                {log.nodeId?.slice(0, 10)}...
              </span>
              <span className="log-agent" title={log.agentId}>
                {log.agentId?.slice(-12)}
              </span>
              <span className={`log-level ${log.level}`}>
                {log.level?.toUpperCase()}
              </span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default Logs;
