'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(url: string): { 
  socket: Socket | null; 
  isConnected: boolean;
  sendMessage: (message: string) => void;
  messages: any[];
} {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Titanio Backend');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Titanio Backend');
      setIsConnected(false);
    });

    newSocket.on('chat:response', (data) => {
      setMessages((prev) => [...prev, {
        id: data.id,
        sender: 'tita',
        text: data.message,
        timestamp: data.timestamp,
        actions: data.actions,
      }]);
    });

    newSocket.on('squad:summoned', (data) => {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        sender: 'tita',
        text: `${data.avatar} ${data.message}`,
        timestamp: new Date().toISOString(),
      }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (socket && isConnected) {
      socket.emit('chat:message', {
        message,
        userId: 'user-1',
      });
    }
  };

  return { socket, isConnected, sendMessage, messages };
}
