import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [agents, setAgents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    const wsUrl = `ws://${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Reconnect in 3s
      setTimeout(() => window.location.reload(), 3000);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleMessage(data);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'init':
        setAgents(data.agents || []);
        setNodes(data.nodes || []);
        break;
      
      case 'agents_updated':
        fetchAgents();
        break;
      
      case 'new_log':
        setLogs(prev => [...prev.slice(-999), data.log]);
        break;
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, [ws]);

  const value = {
    connected,
    agents,
    logs,
    nodes,
    sendMessage,
    refreshAgents: fetchAgents
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
