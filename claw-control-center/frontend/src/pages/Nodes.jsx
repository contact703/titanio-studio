import React, { useState, useEffect } from 'react';
import { Server, Plus, Wifi, WifiOff, Activity } from 'lucide-react';

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [showAddNode, setShowAddNode] = useState(false);
  const [newNode, setNewNode] = useState({ id: '', host: '', port: '3000', token: '' });

  useEffect(() => {
    fetchNodes();
  }, []);

  async function fetchNodes() {
    try {
      const res = await fetch('/api/nodes');
      const data = await res.json();
      setNodes(data.nodes || []);
    } catch (err) {
      console.error('Failed to fetch nodes:', err);
    }
  }

  async function addNode(e) {
    e.preventDefault();
    // Store in local config
    const current = JSON.parse(localStorage.getItem('federation_nodes') || '[]');
    current.push(newNode);
    localStorage.setItem('federation_nodes', JSON.stringify(current));
    
    // Send to backend
    try {
      await fetch('/api/nodes/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNode)
      });
      setShowAddNode(false);
      setNewNode({ id: '', host: '', port: '3000', token: '' });
      fetchNodes();
    } catch (err) {
      console.error('Failed to add node:', err);
    }
  }

  return (
    <div className="nodes-page">
      <header className="page-header">
        <h1><Server size={20} /> Federation Nodes</h1>
        <button className="btn btn-primary" onClick={() => setShowAddNode(true)}>
          <Plus size={16} />
          Add Node
        </button>
      </header>

      <div className="nodes-grid">
        {nodes.map(node => (
          <div key={node.id} className={`node-card card ${node.status}`}>
            <div className="node-header">
              <div className="node-status-icon">
                {node.status === 'local' ? (
                  <Activity size={24} />
                ) : node.status === 'connected' ? (
                  <Wifi size={24} />
                ) : (
                  <WifiOff size={24} />
                )}
              </div>
              <div className="node-info">
                <h3>{node.id}</h3>
                <span className="node-address">{node.host}:{node.port}</span>
              </div>
              <span className={`badge badge-${node.status === 'connected' || node.status === 'local' ? 'running' : 'idle'}`}>
                {node.status}
              </span>
            </div>
            <div className="node-stats">
              <div className="stat">
                <span className="stat-label">Agents</span>
                <span className="stat-value">{node.agentCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Last Seen</span>
                <span className="stat-value">{node.lastSeen ? new Date(node.lastSeen).toLocaleTimeString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Node Modal */}
      {showAddNode && (
        <div className="modal-overlay" onClick={() => setShowAddNode(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={16} /> Add Federation Node</h3>
              <button className="close-btn" onClick={() => setShowAddNode(false)}>×</button>
            </div>
            <form onSubmit={addNode} className="node-form">
              <div className="form-group">
                <label>Node ID</label>
                <input 
                  type="text"
                  value={newNode.id}
                  onChange={e => setNewNode(n => ({ ...n, id: e.target.value }))}
                  placeholder="mac-mini-ilha"
                  required
                />
              </div>
              <div className="form-group">
                <label>Host / IP</label>
                <input 
                  type="text"
                  value={newNode.host}
                  onChange={e => setNewNode(n => ({ ...n, host: e.target.value }))}
                  placeholder="192.168.18.170"
                  required
                />
              </div>
              <div className="form-group">
                <label>Port</label>
                <input 
                  type="number"
                  value={newNode.port}
                  onChange={e => setNewNode(n => ({ ...n, port: e.target.value }))}
                  placeholder="3000"
                />
              </div>
              <div className="form-group">
                <label>Auth Token (optional)</label>
                <input 
                  type="password"
                  value={newNode.token}
                  onChange={e => setNewNode(n => ({ ...n, token: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowAddNode(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nodes;
