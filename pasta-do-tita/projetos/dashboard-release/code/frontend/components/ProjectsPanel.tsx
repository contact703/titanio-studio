'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, Bot, Clock, MoreVertical, Lock } from 'lucide-react';

const projects = [
  { id: 'p1', name: 'Gospia Mobile', description: 'App de gestão', client: 'Gospia', bots: 3, status: 'active', lastActivity: '2 min atrás', protected: false },
  { id: 'p2', name: 'KidsHQ', description: 'Plataforma educacional', client: 'KidsHQ', bots: 0, status: 'active', lastActivity: '1 hora atrás', protected: false },
  { id: 'p3', name: 'KiteMe', description: 'Guia de kitesurf', client: 'Titanio', bots: 2, status: 'active', lastActivity: '3 horas atrás', protected: false },
  { id: 'p4', name: 'Maricá Film', description: 'Site institucional', client: 'Maricá', bots: 1, status: 'completed', lastActivity: '2 dias atrás', protected: false },
  { id: 'p5', name: 'Titanio CC', description: 'Dashboard', client: 'Titanio', bots: 1, status: 'active', lastActivity: 'Agora', protected: false },
  { id: 'teste-real', name: 'Teste Real', description: 'Projeto de teste para ganhar dinheiro', client: 'Titanio Squad', bots: 3, status: 'active', lastActivity: 'Agora', protected: true },
];

export function ProjectsPanel() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleProjectClick = (project: typeof projects[0]) => {
    if (project.protected && !isAuthenticated) {
      setSelectedProject(project.id);
      setShowPasswordModal(true);
      setAuthError('');
      setPassword('');
    } else {
      // Acessar projeto normalmente
      console.log('Acessando projeto:', project.name);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === 'real') {
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setAuthError('');
      // Acessar projeto
      console.log('✅ Acesso autorizado ao Projeto Teste Real');
    } else {
      setAuthError('Senha incorreta!');
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">📁 Projetos</h2>
          <p className="text-gray-400 mt-1">Gerencie seus projetos e bots associados</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan to-purple rounded-lg font-medium"
        >
          <Plus size={18} />
          Novo Projeto
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, y: -2 }}
            onClick={() => handleProjectClick(project)}
            className="bg-card rounded-xl p-5 border border-white/10 hover:border-cyan/30 transition-all cursor-pointer relative"
          >
            {project.protected && (
              <div className="absolute top-3 right-3">
                <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Lock size={16} className="text-warning" />
                </div>
              </div>
            )}

            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
                <FolderOpen size={24} className="text-cyan" />
              </div>
              {!project.protected && (
                <button className="p-1 hover:bg-white/5 rounded-lg transition-colors">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              )}
            </div>

            <h3 className="font-bold text-lg mb-1">{project.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{project.description}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-white/5 rounded-full">
                {project.client}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                project.status === 'active' ? 'bg-success/20 text-success' :
                project.status === 'completed' ? 'bg-purple/20 text-purple' :
                'bg-gray-700 text-gray-400'
              }`}>
                {project.status === 'active' ? 'Ativo' : 'Concluído'}
              </span>
              {project.protected && (
                <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning flex items-center gap-1">
                  <Lock size={10} />
                  Protegido
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Bot size={14} />
                  <span>{project.bots} bots</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{project.lastActivity}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-6 border border-white/10 w-96"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Lock size={32} className="text-warning" />
              </div>
              <h3 className="text-xl font-bold">🔒 Projeto Protegido</h3>
              <p className="text-gray-400 text-sm mt-2">
                O projeto "Teste Real" requer senha para acesso.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Senha:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Digite a senha..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan"
                  autoFocus
                />
              </div>

              {authError && (
                <p className="text-error text-sm text-center">{authError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan to-purple rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Entrar
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              💡 Dica: A senha é "real"
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
