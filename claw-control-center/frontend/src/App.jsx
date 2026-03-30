import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  Terminal, 
  Calendar, 
  FolderOpen, 
  Settings,
  Server,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Logs from './pages/Logs';
import Scheduler from './pages/Scheduler';
import Files from './pages/Files';
import Nodes from './pages/Nodes';
import Tasks from './pages/Tasks';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './App.css';

function App() {
  const [nodeInfo, setNodeInfo] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        setNodeInfo(data);
        setConnected(true);
      })
      .catch(() => setConnected(false));
  }, []);

  return (
    <WebSocketProvider>
      <Router>
        <div className="app">
          <Sidebar nodeInfo={nodeInfo} connected={connected} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/scheduler" element={<Scheduler />} />
              <Route path="/files" element={<Files />} />
              <Route path="/nodes" element={<Nodes />} />
              <Route path="/tasks" element={<Tasks />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WebSocketProvider>
  );
}

function Sidebar({ nodeInfo, connected }) {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/agents', icon: Cpu, label: 'Agents' },
    { path: '/logs', icon: Terminal, label: 'Logs & Console' },
    { path: '/scheduler', icon: Calendar, label: 'Scheduler' },
    { path: '/files', icon: FolderOpen, label: 'Files' },
    { path: '/nodes', icon: Server, label: 'Nodes' },
    { path: '/tasks', icon: Activity, label: 'Tasks ⚡' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <Activity className="logo-icon" />
          <span>Claw Control</span>
        </div>
        <div className="node-badge">
          {connected ? (
            <><Wifi size={14} /> {nodeInfo?.node || 'Local'}</>
          ) : (
            <><WifiOff size={14} /> Offline</>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-panel">
          <div className="status-item">
            <span className="status-dot active"></span>
            <span>OpenClaw</span>
          </div>
          <div className="status-item">
            <span className="status-dot"></span>
            <span>Federation</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default App;
