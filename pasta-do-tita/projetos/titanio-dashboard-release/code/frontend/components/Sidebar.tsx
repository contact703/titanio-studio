'use client';

import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Bot, 
  Users, 
  Settings,
  Mail,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'dashboard' | 'projects' | 'bots' | 'squad') => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projetos', icon: FolderOpen },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'squad', label: 'Squad', icon: Users },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-card border-r border-white/10 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan to-purple rounded-lg flex items-center justify-center text-xl">
            🎮
          </div>
          <div>
            <h1 className="font-bold text-lg">TITANIO</h1>
            <p className="text-xs text-gray-400">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan/20 to-purple/20 border border-cyan/30 text-cyan' 
                  : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition-colors">
          <Mail size={20} />
          <span>Email</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition-colors">
          <Zap size={20} />
          <span>Integrações</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition-colors">
          <Settings size={20} />
          <span>Configurações</span>
        </button>
      </div>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-cyan flex items-center justify-center text-lg">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Eduardo</p>
            <p className="text-xs text-gray-400 truncate">Admin</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>
    </motion.aside>
  );
}
