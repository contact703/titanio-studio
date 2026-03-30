import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Play, Pause, Trash2, Clock } from 'lucide-react';

function Scheduler() {
  const [jobs, setJobs] = useState([]);
  const [showNewJob, setShowNewJob] = useState(false);
  const [newJob, setNewJob] = useState({
    name: '',
    schedule: '',
    agentId: '',
    message: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  }

  async function createJob(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      if (res.ok) {
        setShowNewJob(false);
        setNewJob({ name: '', schedule: '', agentId: '', message: '' });
        fetchJobs();
      }
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  }

  async function toggleJob(id, enabled) {
    try {
      await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      fetchJobs();
    } catch (err) {
      console.error('Failed to toggle job:', err);
    }
  }

  async function deleteJob(id) {
    if (!window.confirm('Delete this job?')) return;
    try {
      await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  }

  return (
    <div className="scheduler-page">
      <header className="page-header">
        <h1><Calendar size={20} /> Scheduler</h1>
        <button className="btn btn-primary" onClick={() => setShowNewJob(true)}>
          <Plus size={16} />
          New Job
        </button>
      </header>

      {/* Jobs List */}
      <div className="jobs-list">
        {jobs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Clock size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <p>No scheduled jobs yet</p>
            <button className="btn btn-primary" onClick={() => setShowNewJob(true)}>
              Create your first job
            </button>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="job-card card">
              <div className="job-info">
                <h3>{job.name}</h3>
                <div className="job-meta">
                  <span className="badge badge-fixed">{job.schedule}</span>
                  <span>Target: {job.agentId || 'All'}</span>
                  {job.lastRun && <span>Last: {new Date(job.lastRun).toLocaleString()}</span>}
                  {job.nextRun && <span>Next: {new Date(job.nextRun).toLocaleString()}</span>}
                </div>
                <p className="job-message">{job.message}</p>
              </div>
              <div className="job-actions">
                <button 
                  className={`btn ${job.enabled ? 'btn-warning' : 'btn-primary'}`}
                  onClick={() => toggleJob(job.id, !job.enabled)}
                >
                  {job.enabled ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Enable</>}
                </button>
                <button className="btn btn-danger" onClick={() => deleteJob(job.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Job Modal */}
      {showNewJob && (
        <div className="modal-overlay" onClick={() => setShowNewJob(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={16} /> New Scheduled Job</h3>
              <button className="close-btn" onClick={() => setShowNewJob(false)}>×</button>
            </div>
            <form onSubmit={createJob} className="job-form">
              <div className="form-group">
                <label>Job Name</label>
                <input 
                  type="text"
                  value={newJob.name}
                  onChange={e => setNewJob(j => ({ ...j, name: e.target.value }))}
                  placeholder="Daily Report"
                  required
                />
              </div>

              <div className="form-group">
                <label>Schedule (Cron Expression)</label>
                <input 
                  type="text"
                  value={newJob.schedule}
                  onChange={e => setNewJob(j => ({ ...j, schedule: e.target.value }))}
                  placeholder="0 9 * * * (daily at 9am)"
                  required
                />
                <small>Examples: 0 */3 * * * (every 3h), 0 9 * * 1 (Mondays 9am)</small>
              </div>

              <div className="form-group">
                <label>Target Agent (optional)</label>
                <input 
                  type="text"
                  value={newJob.agentId}
                  onChange={e => setNewJob(j => ({ ...j, agentId: e.target.value }))}
                  placeholder="Leave empty for all agents"
                />
              </div>

              <div className="form-group">
                <label>Message / Command</label>
                <textarea 
                  value={newJob.message}
                  onChange={e => setNewJob(j => ({ ...j, message: e.target.value }))}
                  placeholder="Run system check and report status"
                  rows={4}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setShowNewJob(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduler;
