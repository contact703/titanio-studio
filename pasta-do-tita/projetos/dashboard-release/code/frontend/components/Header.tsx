'use client';

import { motion } from 'framer-motion';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/10 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar bots, projetos, ou comandos..."
            className="w-full bg-background border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
          {isConnected ? (
            <>
              <Wifi size={16} className="text-success" />
              <span className="text-xs text-success">Conectado</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-error" />
              <span className="text-xs text-error">Desconectado</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyan rounded-full animate-pulse" />
        </motion.button>

        {/* Quick Actions */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-gradient-to-r from-cyan to-purple rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          + Novo Bot
        </motion.button>
      </div>
    </header>
  );
}
