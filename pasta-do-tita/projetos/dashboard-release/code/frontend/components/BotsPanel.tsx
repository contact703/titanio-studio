'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, Pause, Square, MoreVertical, Activity, RefreshCw } from 'lucide-react';

interface BotData {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'paused' | 'stopped';
  projectId: string;
  stats: {
    messagesProcessed: number;
    uptime: string;
  };
}

const statusColors = {
  running: 'bg-success',
  paused: 'bg-warning',
  stopped: 'bg-gray-600',
};

const statusLabels = {
  running: 'Rodando',
  paused: 'Pausado',
  stopped: 'Parado',
};

export function BotsPanel() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await fetch('http://localhost:4444/api/bots');
      const data = await response.json();
      setBots(data);
    } catch (error) {
      console.error('Error fetching bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const controlBot = async (botId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      const response = await fetch(`http://localhost:4444/api/bots/${botId}/${action}`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchBots(); // Refresh list
      }
    } catch (error) {
      console.error(`Error ${action}ing bot:`, error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">🤖 Bots</h2>
          <p className="text-gray-400 mt-1">Gerencie todos os seus bots em um lugar</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card px-4 py-2 rounded-lg border border-white/10">
            <span className="text-gray-400 text-sm">Rodando</span>
            <p className="text-xl font-bold text-success">{bots.filter(b => b.status === 'running').length}</p>
          </div>
          <div className="bg-card px-4 py-2 rounded-lg border border-white/10">
            <span className="text-gray-400 text-sm">Total</span>
            <p className="text-xl font-bold">{bots.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Bot</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Projeto</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Mensagens</th>
              <th className="text-left py-3 px-4 font-medium text-gray-400">Uptime</th>
              <th className="text-right py-3 px-4 font-medium text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot, index) => (
              <motion.tr
                key={bot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
                      <Bot size={20} className="text-cyan" />
                    </div>
                    <div>
                      <p className="font-medium">{bot.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{bot.type}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm">{bot.projectId}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColors[bot.status]} ${bot.status === 'running' ? 'animate-pulse' : ''}`} />
                    <span className="text-sm">{statusLabels[bot.status]}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm">{bot.stats.messagesProcessed.toLocaleString()}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-gray-400" />
                    <span className="text-sm">{bot.stats.uptime}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    {bot.status !== 'running' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => controlBot(bot.id, 'start')}
                        className="p-2 hover:bg-success/20 rounded-lg transition-colors text-success"
                        title="Iniciar"
                      >
                        <Play size={16} />
                      </motion.button>
                    )}
                    {bot.status === 'running' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => controlBot(bot.id, 'pause')}
                        className="p-2 hover:bg-warning/20 rounded-lg transition-colors text-warning"
                        title="Pausar"
                      >
                        <Pause size={16} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => controlBot(bot.id, 'stop')}
                      className="p-2 hover:bg-error/20 rounded-lg transition-colors text-error"
                      title="Parar"
                    >
                      <Square size={16} />
                    </motion.button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
