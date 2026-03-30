import React, { useState, useEffect } from 'react';

function Tasks() {
  const [tasks, setTasks] = useState({ active_tasks: [], completed_tasks: [] });
  const [pipelines, setPipelines] = useState({});
  const [lightning, setLightning] = useState({ specialists: {} });
  const [newTask, setNewTask] = useState('');
  const [delegating, setDelegating] = useState(false);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAll() {
    try {
      const [tasksRes, pipRes, lightRes] = await Promise.all([
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/tasks/pipelines').then(r => r.json()),
        fetch('/api/lightning/report').then(r => r.json()),
      ]);
      setTasks(tasksRes);
      setPipelines(pipRes.pipelines || {});
      setLightning(lightRes);
    } catch (e) { console.error(e); }
  }

  async function delegateTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setDelegating(true);
    try {
      const res = await fetch('/api/tasks/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask, requester: 'Dashboard' })
      });
      const data = await res.json();
      if (data.success) {
        setNewTask('');
        fetchAll();
      }
    } catch (e) { console.error(e); }
    setDelegating(false);
  }

  async function completeTask(taskId) {
    const learning = prompt('O que o especialista aprendeu? (ou deixe vazio)');
    try {
      await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: 8, learning: learning || '' })
      });
      fetchAll();
    } catch (e) { console.error(e); }
  }

  async function handoffTask(taskId) {
    try {
      await fetch(`/api/tasks/${taskId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchAll();
    } catch (e) { console.error(e); }
  }

  const gradeColor = (grade) => {
    if (!grade) return '#666';
    if (grade.includes('AAA')) return '#FFD700';
    if (grade.includes('AA')) return '#C0C0C0';
    if (grade.includes('A')) return '#4CAF50';
    if (grade.includes('B')) return '#FF9800';
    return '#F44336';
  };

  const specialists = lightning.specialists || {};

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', color: '#E0E0E0', background: '#1a1a2e', minHeight: '100vh' }}>
      <h1 style={{ color: '#00D4FF', marginBottom: '20px' }}>⚡ Tasks & Specialists</h1>

      {/* Delegate Task */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ color: '#00D4FF', fontSize: '16px', marginBottom: '12px' }}>Nova Task</h2>
        <form onSubmit={delegateTask} style={{ display: 'flex', gap: '10px' }}>
          <input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Ex: Criar video sobre IA pro Instagram"
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#0f3460', color: '#fff', fontSize: '14px' }}
          />
          <button
            type="submit"
            disabled={delegating}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#00D4FF', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {delegating ? '...' : '🚀 Delegar'}
          </button>
        </form>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
          Keywords: {Object.keys(pipelines).join(', ')}
        </div>
      </div>

      {/* Active Tasks */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ color: '#00D4FF', fontSize: '16px', marginBottom: '12px' }}>
          Tasks Ativas ({tasks.active_tasks?.length || 0})
        </h2>
        {(tasks.active_tasks || []).map(task => (
          <div key={task.id} style={{ background: '#0f3460', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{task.title}</strong>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  👤 {task.assigned_to} | 📋 {task.handoff_chain?.join(' → ')} | {task.status}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handoffTask(task.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#FF9800', color: '#000', cursor: 'pointer', fontSize: '12px' }}>
                  ➡️ Handoff
                </button>
                <button onClick={() => completeTask(task.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#4CAF50', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                  ✅ Complete
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!tasks.active_tasks || tasks.active_tasks.length === 0) && (
          <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Nenhuma task ativa</div>
        )}
      </div>

      {/* Specialist Performance */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ color: '#00D4FF', fontSize: '16px', marginBottom: '12px' }}>
          ⚡ Performance ({Object.keys(specialists).length} specialists)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(specialists)
            .sort(([,a], [,b]) => (b.avg_score || 0) - (a.avg_score || 0))
            .map(([name, s]) => (
              <div key={name} style={{ background: '#0f3460', borderRadius: '8px', padding: '12px', borderLeft: `3px solid ${gradeColor(s.grade)}` }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{name}</div>
                <div style={{ fontSize: '20px', color: gradeColor(s.grade), marginTop: '4px' }}>{s.grade}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  Avg: {s.avg_score}/10 | Tasks: {s.total_tasks} | Win: {s.total_tasks > 0 ? Math.round(s.successes/s.total_tasks*100) : 0}%
                </div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  🔥 Streak: {s.streak} | Best: {s.best_streak}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Completed Tasks */}
      <div style={{ background: '#16213e', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ color: '#00D4FF', fontSize: '16px', marginBottom: '12px' }}>
          Completadas ({tasks.completed_tasks?.length || 0})
        </h2>
        {(tasks.completed_tasks || []).slice(-5).reverse().map(task => (
          <div key={task.id} style={{ background: '#0f3460', borderRadius: '8px', padding: '10px', marginBottom: '6px', opacity: 0.7 }}>
            <div style={{ fontSize: '13px' }}>✅ {task.title}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              👤 {task.assigned_to} | {new Date(task.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {/* Team Stats */}
      {lightning.team_average && (
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#888' }}>
          📊 Team Average: {lightning.team_average}/10 | Total Tasks: {lightning.total_tasks} | Success: {lightning.total_success}
        </div>
      )}
    </div>
  );
}

export default Tasks;
