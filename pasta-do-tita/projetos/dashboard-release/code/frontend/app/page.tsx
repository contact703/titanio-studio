'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatPanel } from '@/components/ChatPanel';
import { SquadPanel } from '@/components/SquadPanel';
import { ProjectsPanel } from '@/components/ProjectsPanel';
import { BotsPanel } from '@/components/BotsPanel';
import { useSocket } from '@/hooks/useSocket';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'bots' | 'squad'>('dashboard');
  const { isConnected, socket } = useSocket('http://localhost:4444');

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header isConnected={isConnected} />
        
        <main className="flex-1 overflow-hidden p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && <DashboardOverview />}
            {activeTab === 'projects' && <ProjectsPanel />}
            {activeTab === 'bots' && <BotsPanel />}
            {activeTab === 'squad' && <SquadPanel />}
          </motion.div>
        </main>
      </div>

      {/* Right Panel - Chat */}
      <ChatPanel socket={socket} />
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* Stats Cards */}
      <div className="col-span-3 grid grid-cols-4 gap-4">
        <StatCard 
          title="Bots Ativos" 
          value="12" 
          trend="+2" 
          icon="🤖" 
          color="cyan"
        />
        <StatCard 
          title="Projetos" 
          value="5" 
          trend="+1" 
          icon="📁" 
          color="purple"
        />
        <StatCard 
          title="Especialistas" 
          value="8" 
          trend="online" 
          icon="👥" 
          color="success"
        />
        <StatCard 
          title="Gastos (Mês)" 
          value="R$ 245" 
          trend="-12%" 
          icon="💰" 
          color="warning"
        />
      </div>

      {/* Main Content Area */}
      <div className="col-span-2 space-y-6">
        <div className="bg-card rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-gradient mb-4">🚀 Atividade Recente</h2>
          <div className="space-y-3">
            <ActivityItem 
              icon="🤖"
              title="Bot 'WhatsApp Auto-Reply' iniciado"
              time="2 minutos atrás"
              project="Gospia Mobile"
            />
            <ActivityItem 
              icon="👨‍💻"
              title="Code Ninja completou task"
              time="5 minutos atrás"
              project="Dashboard"
            />
            <ActivityItem 
              icon="📁"
              title="Projeto 'KidsHQ' criado"
              time="1 hora atrás"
              project="KidsHQ"
            />
            <ActivityItem 
              icon="🚀"
              title="Deploy realizado com sucesso"
              time="2 horas atrás"
              project="KiteMe"
            />
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-gradient mb-4">⚡ Frota de Mac Minis</h2>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <MacMiniCard key={i} id={i} status={i <= 3 ? 'online' : 'offline'} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="space-y-6">
        <div className="bg-card rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-gradient mb-4">👥 Squad Status</h2>
          <div className="space-y-3">
            {[
              { name: 'Code Ninja', avatar: '👨‍💻', status: 'available' },
              { name: 'Design Wizard', avatar: '🎨', status: 'busy' },
              { name: 'Debug Hunter', avatar: '🔍', status: 'available' },
              { name: 'DevOps Ninja', avatar: '🚀', status: 'available' },
            ].map((specialist) => (
              <div key={specialist.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-2xl">{specialist.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium">{specialist.name}</p>
                  <p className={`text-sm ${specialist.status === 'available' ? 'text-success' : 'text-warning'}`}>
                    {specialist.status === 'available' ? 'Disponível' : 'Ocupado'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${specialist.status === 'available' ? 'bg-success' : 'bg-warning'} ${specialist.status === 'available' ? 'animate-pulse' : ''}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-gradient mb-4">📊 Uso de Recursos</h2>
          <ResourceBar label="CPU" value={45} color="cyan" />
          <ResourceBar label="RAM" value={62} color="purple" />
          <ResourceBar label="Disco" value={78} color="success" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: { 
  title: string; 
  value: string; 
  trend: string; 
  icon: string;
  color: 'cyan' | 'purple' | 'success' | 'warning';
}) {
  const colorClasses = {
    cyan: 'from-cyan/20 to-cyan/5 border-cyan/30',
    purple: 'from-purple/20 to-purple/5 border-purple/30',
    success: 'from-success/20 to-success/5 border-success/30',
    warning: 'from-warning/20 to-warning/5 border-warning/30',
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-success' : trend.startsWith('-') ? 'text-error' : 'text-gray-400'}`}>
        {trend}
      </p>
    </motion.div>
  );
}

function ActivityItem({ icon, title, time, project }: { 
  icon: string; 
  title: string; 
  time: string;
  project: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{title}</p>
        <p className="text-sm text-gray-400">{project}</p>
      </div>
      <p className="text-xs text-gray-500 whitespace-nowrap">{time}</p>
    </div>
  );
}

function MacMiniCard({ id, status }: { id: number; status: 'online' | 'offline' }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-lg border text-center ${
        status === 'online' 
          ? 'bg-success/10 border-success/30' 
          : 'bg-gray-800/50 border-gray-700'
      }`}
    >
      <div className="text-3xl mb-2">🖥️</div>
      <p className="font-mono text-sm">Mac-{id}</p>
      <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${status === 'online' ? 'bg-success animate-pulse' : 'bg-gray-600'}`} />
    </motion.div>
  );
}

function ResourceBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan',
    purple: 'bg-purple',
    success: 'bg-success',
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-sm text-gray-400">{value}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
}
