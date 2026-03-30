'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Bot, User } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface Message {
  id: number;
  sender: 'user' | 'tita';
  text: string;
  timestamp: Date;
  actions?: any[];
}

interface ChatPanelProps {
  socket: Socket | null;
}

export function ChatPanel({ socket }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'tita',
      text: 'Olá! Sou a Tita, sua assistente no Titanio Command Center.\n\nPosso te ajudar com:\n• Criar bots\n• Criar projetos\n• Chamar especialistas\n• Listar bots, projetos ou squad\n\nO que você precisa? 🤖',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:response', (data) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          sender: 'tita',
          text: data.message,
          timestamp: new Date(data.timestamp),
          actions: data.actions,
        },
      ]);
    });

    socket.on('squad:summoned', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'tita',
          text: `${data.avatar} ${data.message}`,
          timestamp: new Date(),
        },
      ]);
    });

    return () => {
      socket.off('chat:response');
      socket.off('squad:summoned');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    socket.emit('chat:message', {
      message: input,
      userId: 'user-1',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-96 bg-card border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-xl animate-pulse">
            🐾
          </div>
          <div>
            <h3 className="font-bold">Tita</h3>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-purple/20' 
                  : 'bg-gradient-to-br from-cyan to-purple'
              }`}>
                {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                message.sender === 'user'
                  ? 'bg-purple/20 rounded-tr-sm'
                  : 'bg-white/5 rounded-tl-sm'
              }`}>
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-cyan"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-cyan"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-cyan"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 bg-background rounded-lg border border-white/10 p-2">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Fale com a Tita..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
            <Mic size={18} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2 bg-gradient-to-r from-cyan to-purple rounded-lg disabled:opacity-50"
          >
            <Send size={18} />
          </motion.button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Pressione Enter para enviar
        </p>
      </div>
    </div>
  );
}
