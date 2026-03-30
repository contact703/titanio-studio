import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Clock, 
  Server, 
  Zap,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { useWebSocket } from '../contexts/WebSocketContext';

function Dashboard() {
  const { agents, nodes, refreshAgents } = useWebSocket();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    refreshAgents();
    fetchStats();
    fetchRecentLogs();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setStats(data.summary);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  async function fetchRecentLogs() {
    try {
      const res = await fetch('/api/logs?limit=10');
      const data = await res.json();
      setRecentLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={refreshAgents}>
            <Activity size={16} />
            Refresh
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <StatCard 
          icon={Cpu}
          label="Total Agents"
          value={stats?.total || 0}
          subtext={`${stats?.running || 0} running`}
          color="primary"
        />
        <StatCard 
          icon={Zap}
          label="Fixed Agents"
          value={stats?.fixed || 0}
          subtext="Persistent"
          color="success"
        />
        <StatCard 
          icon={Clock}
          label="Temporary"
          value={stats?.temporary || 0}
          subtext="Session-based"
          color="warning"
        />
        <StatCard 
          icon={Server}
          label="Nodes Online"
          value={(nodes?.length || 0) + 1}
          subtext="In federation"
          color="info"
        />
      </div>

      {/* Agents por Node */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3 className="card-title">Agents by Node</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Total Agents</th>
                <th>Running</th>
                <th>Fixed</th>
                <th>Temporary</th>
              </tr>
            </thead>
            <tbody>
              {stats?.byNode && Object.entries(stats.byNode).map(([node, count]) => (
                <tr key={node}>
                  <td>
                    <span className={`badge ${node === 'local' ? 'badge-fixed' : 'badge-temp'}`}>
                      {node}
                    </span>
                  </td>
                  <td>{count}</td>
                  <td>{agents.filter(a => a.nodeId === node && a.status === 'running').length}</td>
                  <td>{agents.filter(a => a.nodeId === node && a.type?.type === 'fixed').length}</td>
                  <td>{agents.filter(a => a.nodeId === node && a.type?.type === 'temporary').length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><Terminal size={16} /> Recent Logs</h3>
          </div>
          <div className="logs-container" style={{ maxHeight: '300px' }}>
            {recentLogs.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
                No recent logs
              </div>
            ) : (
              recentLogs.map((log, i) => (
                <div key={i} className="log-entry">
                  <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="log-node">{log.nodeId}</span>
                  <span className={`log-level ${log.level}`}>{log.level}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><AlertCircle size={16} /> Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <QuickAction 
              label="Discover New Agents"
              description="Scan for new OpenClaw sessions"
              onClick={refreshAgents}
            />
            <QuickAction 
              label="Clean Temporary Agents"
              description="Remove idle temporary sessions"
              onClick={() => {}}
            />
            <QuickAction 
              label="Export Logs"
              description="Download recent logs as JSON"
              onClick={() => {}}
            />
            <QuickAction 
              label="System Health"
              description="Check all nodes status"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    primary: { bg: 'rgba(99, 102, 241, 0.2)', text: '#6366f1' },
    success: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
    warning: { bg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
    info: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
  };
  
  const c = colors[color];
  
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: c.bg, color: c.text }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{label}</div>
        <div className="card-value">{value}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtext}</div>
      </div>
    </div>
  );
}

function QuickAction({ label, description, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        color: 'inherit',
        textAlign: 'left',
        transition: 'all 0.2s',
        width: '100%'
      }}
      onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.02)'}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{description}</div>
    </button>
  );
}

export default Dashboard;
