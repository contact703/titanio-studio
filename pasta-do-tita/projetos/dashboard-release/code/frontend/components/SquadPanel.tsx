'use client';

import { motion } from 'framer-motion';
import { Users, Zap, Award } from 'lucide-react';

const specialists = [
  { id: 'code-ninja', name: 'Code Ninja', avatar: '/avatars/code-ninja.png', role: 'Desenvolvimento', skills: ['JavaScript', 'React', 'Node.js'], status: 'available', tasksCompleted: 47 },
  { id: 'design-wizard', name: 'Design Wizard', avatar: '/avatars/design-wizard.png', role: 'UI/UX Design', skills: ['Figma', 'Tailwind', 'Animações'], status: 'busy', tasksCompleted: 32 },
  { id: 'debug-hunter', name: 'Debug Hunter', avatar: '/avatars/debug-hunter.png', role: 'Debugging', skills: ['Logs', 'Testing', 'Performance'], status: 'available', tasksCompleted: 89 },
  { id: 'devops-ninja', name: 'DevOps Ninja', avatar: '/avatars/devops-ninja.png', role: 'Infraestrutura', skills: ['Docker', 'CI/CD', 'AWS'], status: 'available', tasksCompleted: 23 },
  { id: 'aso-specialist', name: 'ASO Specialist', avatar: '/avatars/aso-specialist.png', role: 'App Store', skills: ['Play Store', 'Keywords', 'Metadata'], status: 'offline', tasksCompleted: 15 },
  { id: 'growth-hacker', name: 'Growth Hacker', avatar: '/avatars/growth-hacker.png', role: 'Growth', skills: ['Analytics', 'Funnel', 'Aquisição'], status: 'available', tasksCompleted: 28 },
  { id: 'api-master', name: 'API Master', avatar: '/avatars/api-master.png', role: 'Integrações', skills: ['REST', 'GraphQL', 'Webhooks'], status: 'available', tasksCompleted: 56 },
  { id: 'security-guard', name: 'Security Guard', avatar: '/avatars/security-guard.png', role: 'Segurança', skills: ['Auth', 'JWT', 'Encryption'], status: 'available', tasksCompleted: 34 },
];

export function SquadPanel() {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient">👥 Squad de Especialistas</h2>
          <p className="text-gray-400 mt-1">Time virtual de experts prontos para ajudar</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card px-4 py-2 rounded-lg border border-white/10">
            <span className="text-gray-400 text-sm">Disponíveis</span>
            <p className="text-xl font-bold text-success">{specialists.filter(s => s.status === 'available').length}</p>
          </div>
          <div className="bg-card px-4 py-2 rounded-lg border border-white/10">
            <span className="text-gray-400 text-sm">Ocupados</span>
            <p className="text-xl font-bold text-warning">{specialists.filter(s => s.status === 'busy').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {specialists.map((specialist, index) => (
          <motion.div
            key={specialist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-card rounded-xl p-5 border border-white/10 hover:border-cyan/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <img 
                src={specialist.avatar} 
                alt={specialist.name}
                className="w-16 h-16 rounded-xl object-cover group-hover:scale-110 transition-transform border border-white/10"
                onError={(e) => {
                  // Fallback to emoji if image fails
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.className = 'text-4xl';
                  fallback.textContent = specialist.id === 'code-ninja' ? '👨‍💻' :
                    specialist.id === 'design-wizard' ? '🎨' :
                    specialist.id === 'debug-hunter' ? '🔍' :
                    specialist.id === 'devops-ninja' ? '🚀' :
                    specialist.id === 'aso-specialist' ? '📱' :
                    specialist.id === 'growth-hacker' ? '📈' :
                    specialist.id === 'api-master' ? '🔌' : '🛡️';
                  e.target.parentElement?.appendChild(fallback);
                }}
              />
              <div className={`w-3 h-3 rounded-full ${
                specialist.status === 'available' ? 'bg-success animate-pulse' :
                specialist.status === 'busy' ? 'bg-warning' :
                'bg-gray-600'
              }`} />
            </div>
            
            <h3 className="font-bold text-lg mb-1">{specialist.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{specialist.role}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {specialist.skills.slice(0, 3).map(skill => (
                <span key={skill} className="text-xs px-2 py-1 bg-white/5 rounded-full">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Award size={14} />
                <span>{specialist.tasksCompleted} tasks</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={specialist.status !== 'available'}
                className="px-3 py-1 bg-gradient-to-r from-cyan to-purple rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Chamar
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
