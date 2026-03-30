import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  Square, 
  Terminal, 
  RefreshCw,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useWebSocket } from '../contexts/WebSocketContext';

function Agents() {
  const { agents, refreshAgents } = useWebSocket();
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    let filtered = agents;
    
    if (filter !== 'all') {
      filtered = filtered.filter(a => {
        if (filter === 'running') return a.status === 'running';
        if (filter === 'fixed') return a.type?.type === 'fixed';
        if (filter === 'temp') return a.type?.type === 'temporary';
        return true;
      });
    }
    
    if (search) {
      filtered = filtered.filter(a => 
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.id?.toLowerCase().includes(search.toLowerCase()) ||
        a.nodeId?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    setFilteredAgents(filtered);
  }, [agents, filter, search]);

  async function handleAction(agentId, action) {
    try {
      const res = await fetch(`/api/agents/${agentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      console.log('Action result:', data);
      refreshAgents();
    } catch (err) {
      console.error('Action failed:', err);
    }
  }

  function openConsole(agent) {
    setSelectedAgent(agent);
    setConsoleOpen(true);
  }

  return (
    <div className="agents-page">
      <header className="page-header">
        <h1>Agents</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={refreshAgents}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="filter-bar">
        <FilterChip 
          label="All" 
          count={agents.length} 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        />
        <FilterChip 
          label="Running" 
          count={agents.filter(a => a.status === 'running').length}
          active={filter === 'running'} 
          onClick={() => setFilter('running')}
        />
        <FilterChip 
          label="Fixed" 
          count={agents.filter(a => a.type?.type === 'fixed').length}
          active={filter === 'fixed'} 
          onClick={() => setFilter('fixed')}
        />
        <FilterChip 
          label="Temporary" 
          count={agents.filter(a => a.type?.type === 'temporary').length}
          active={filter === 'temp'} 
          onClick={() => setFilter('temp')}
        />
      </div>

      {/* Agents Grid */}
      <div className="agents-grid">
        {filteredAgents.map(agent => (
          <AgentCard 
            key={agent.id}
            agent={agent}
            onAction={handleAction}
            onOpenConsole={openConsole}
          />
        ))}
      </div>

      {/* Console Modal */}
      {consoleOpen && selectedAgent && (
        <AgentConsole 
          agent={selectedAgent}
          onClose={() => setConsoleOpen(false)}
        />
      )}
    </div>
  );
}

function AgentCard({ agent, onAction, onOpenConsole }) {
  const isRunning = agent.status === 'running';
  const isFixed = agent.type?.type === 'fixed';

  return (
    <div className={`agent-card ${isRunning ? 'running' : ''}`}>
      <div className="agent-header">
        <div className="agent-icon">
          <Cpu size={20} />
          {isRunning && <span className="status-pulse"></span>}
        </div>
        <div className="agent-info">
          <h3 className="agent-name">{agent.name}</h3>
          <span className="agent-id">{agent.id?.slice(-12)}</span>
        </div>
        <div className="agent-badges">
          <span className={`badge badge-${isRunning ? 'running' : 'idle'}`}>
            {isRunning ? '● Running' : '○ Idle'}
          </span>
          <span className={`badge badge-${isFixed ? 'fixed' : 'temp'}`}>
            {isFixed ? 'Fixed' : 'Temp'}
          </span>
        </div>
      </div>

      <div className="agent-details">
        <div className="detail-row">
          <span className="detail-label">Node</span>
          <span className="detail-value">{agent.nodeId}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Model</span>
          <span className="detail-value">{agent.model}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Tokens</span>
          <span className="detail-value">
            {((agent.tokensIn || 0) + (agent.tokensOut || 0)).toLocaleString()}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Uptime</span>
          <span className="detail-value">{formatUptime(agent.uptime)}</span>
        </div>
      </div>

      <div className="agent-actions">
        <button 
          className="action-btn"
          onClick={() => onOpenConsole(agent)}
          title="Open Console"
        >
          <Terminal size={16} />
        </button>
        {isRunning ? (
          <>
            <button 
              className="action-btn warning"
              onClick={() => onAction(agent.id, 'pause')}
              title="Pause"
            >
              <Pause size={16} />
            </button>
            <button 
              className="action-btn danger"
              onClick={() => onAction(agent.id, 'kill')}
              title="Kill"
            >
              <Square size={16} />
            </button>
          </>
        ) : (
          <button 
            className="action-btn success"
            onClick={() => onAction(agent.id, 'resume')}
            title="Resume"
          >
            <Play size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function AgentConsole({ agent, onClose }) {
  const [logs, setLogs] = useState([]);
  const [command, setCommand] = useState('');

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [agent.id]);

  async function fetchLogs() {
    try {
      const res = await fetch(`/api/logs?agentId=${agent.id}&limit=50`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }

  async function sendCommand(e) {
    e.preventDefault();
    if (!command.trim()) return;

    try {
      await fetch(`/api/agents/${agent.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_message', 
          payload: { message: command }
        })
      });
      setCommand('');
      fetchLogs();
    } catch (err) {
      console.error('Failed to send command:', err);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal console-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Terminal size={16} /> Console: {agent.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="console-output">
          {logs.map((log, i) => (
            <div key={i} className="console-line">
              <span className="console-time">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`console-level ${log.level}`}>
                [{log.level?.toUpperCase()}]
              </span>
              <span className="console-message">{log.message}</span>
            </div>
          ))}
        </div>
        <form className="console-input" onSubmit={sendCommand}>
          <span className="prompt">$</span>
          <input 
            type="text"
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder="Enter command..."
            autoFocus
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, onClick }) {
  return (
    <button 
      className={`filter-chip ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {label}
      <span className="count">{count}</span>
    </button>
  );
}

function formatUptime(seconds) {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default Agents;
