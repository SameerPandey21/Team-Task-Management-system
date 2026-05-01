import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { Plus, Trash2, CheckCircle2, Clock, Circle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Compute project-level status from tasks array
function computeProjectStatus(tasks) {
  if (!tasks || tasks.length === 0) return 'Not Started';
  const allDone = tasks.every(t => t.status === 'Done');
  if (allDone) return 'Completed';
  const anyActive = tasks.some(t => t.status === 'In Progress' || t.status === 'Done');
  if (anyActive) return 'In Progress';
  return 'Not Started';
}

const STATUS_STYLE = {
  'Not Started': { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', Icon: Circle },
  'In Progress': { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  'Completed':   { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', Icon: CheckCircle2 },
};

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetchWithAuth('/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/projects', {
        method: 'POST',
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        setShowModal(false);
        setNewProject({ name: '', description: '' });
        fetchProjects();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const res = await fetchWithAuth(`/projects/${projectId}`, { method: 'DELETE' });
        if (res.ok) fetchProjects();
      } catch (err) { console.error(err); }
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p>Loading projects...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-4">
        <div>
          <h1>Projects</h1>
          <p className="subtitle">Manage your team's workspaces and tasks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📁</div>
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>No projects yet</h3>
          <p style={{ marginBottom: '24px' }}>Create your first project to start collaborating with your team.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Create a Project
          </button>
        </div>
      ) : (
        <div className="stats-grid">
          {projects.map((project, idx) => {
            const status = computeProjectStatus(project.tasks || []);
            const totalTasks = (project.tasks || []).length;
            const doneTasks = (project.tasks || []).filter(t => t.status === 'Done').length;
            const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
            const ss = STATUS_STYLE[status];
            const StatusIcon = ss.Icon;

            return (
              <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  className="glass-card animate-fade-up"
                  style={{
                    height: '100%',
                    animationDelay: `${idx * 0.08}s`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderTop: `3px solid ${ss.color}`,
                    position: 'relative'
                  }}
                >
                  {/* Top row: title + delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ marginBottom: 0, textTransform: 'none', letterSpacing: 0, fontSize: '1.05rem' }}>
                      {project.name}
                    </h3>
                    {project.owner.id === user?.id && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px', borderRadius: '50%', flexShrink: 0 }}
                        onClick={(e) => handleDelete(e, project.id)}
                        title="Delete Project"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Project Status Badge */}
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 12px', borderRadius: '9999px',
                      background: ss.bg, color: ss.color,
                      border: `1.5px solid ${ss.border}`,
                      fontSize: '0.73rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      <StatusIcon size={11} />
                      {status}
                    </span>
                  </div>

                  {/* Progress bar (only if has tasks) */}
                  {totalTasks > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                        <span>{doneTasks}/{totalTasks} tasks done</span>
                        <span style={{ fontWeight: 700, color: progress === 100 ? '#10b981' : 'var(--text-primary)' }}>{progress}%</span>
                      </div>
                      <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progress}%`, height: '100%',
                          background: progress === 100
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                          borderRadius: '9999px',
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Footer row */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <span className="badge badge-progress">{project.members.length} Members</span>
                    {totalTasks === 0 && <span className="badge badge-todo">No Tasks</span>}
                    {project.owner.id === user?.id && <span className="badge badge-high">Admin</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ width: '420px', padding: '28px', animation: 'fadeUp 0.3s ease' }}>
            <div className="flex-between mb-4">
              <h2>Create Project</h2>
              <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input required className="form-input" placeholder="e.g. Website Redesign" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" style={{ minHeight: '90px' }} placeholder="What is this project about?" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
