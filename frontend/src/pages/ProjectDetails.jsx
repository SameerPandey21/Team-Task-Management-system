import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { Plus, UserPlus, Trash2, Edit2, Calendar, CheckCircle2, Clock, Circle, Layers, X, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const STATUS_CONFIG = {
  'To Do':       { icon: Circle,       color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  'In Progress': { icon: Clock,        color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  'Done':        { icon: CheckCircle2, color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7' }
};

const PROJECT_STATUS_CONFIG = {
  'Not Started': { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', Icon: Circle },
  'In Progress': { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  'Completed':   { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', Icon: CheckCircle2 }
};

/* ── Add Member Modal (ID + Name) ── */
function AddMemberModal({ members, onAdd, onClose }) {
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{5}$/.test(memberId)) {
      setError('Member ID must be exactly 5 numeric digits.');
      return;
    }
    if (!memberName.trim()) {
      setError('Member name is required.');
      return;
    }
    setLoading(true);
    const result = await onAdd(memberId, memberName.trim());
    setLoading(false);
    if (result?.error) setError(result.error);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel" style={{ width: '400px', padding: '28px', animation: 'fadeUp 0.3s ease' }}>
        <div className="flex-between mb-4">
          <h2>Add Member</h2>
          <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Enter a 5-digit member ID and their display name.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">5-Digit Member ID</label>
            <input
              className="form-input"
              placeholder="e.g. 12345"
              maxLength={5}
              value={memberId}
              onChange={e => setMemberId(e.target.value.replace(/\D/g, ''))}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Member Name</label>
            <input
              className="form-input"
              placeholder="e.g. Jane Smith"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'var(--danger-color)', fontSize: '0.83rem', marginBottom: '10px' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Adding…' : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Edit Project Status Modal ── */
function EditStatusModal({ currentStatus, onSave, onClose }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await onSave(status);
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel" style={{ width: '360px', padding: '28px', animation: 'fadeUp 0.3s ease' }}>
        <div className="flex-between mb-4">
          <h2>Edit Project Status</h2>
          <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {['Not Started', 'In Progress', 'Completed'].map(s => {
            const cfg = PROJECT_STATUS_CONFIG[s];
            const StatusIcon = cfg.Icon;
            const active = status === s;
            return (
              <button key={s} type="button" onClick={() => setStatus(s)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', border: `2px solid ${active ? cfg.border : 'var(--border-color)'}`, background: active ? cfg.bg : 'white', color: active ? cfg.color : 'var(--text-secondary)', fontWeight: active ? 700 : 500, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                <StatusIcon size={18} />
                {s}
              </button>
            );
          })}
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Save Status'}
        </button>
      </div>
    </div>
  );
}

/* ── Task Form Modal ── */
function TaskModal({ task, members, onSubmit, onClose, isEdit }) {
  const [form, setForm] = useState(task);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel" style={{ width: '440px', padding: '28px', animation: 'fadeUp 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex-between mb-4">
          <h2>{isEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input required className="form-input" placeholder="Task title…" value={form.title || ''} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Optional details…" value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority || 'Medium'} onChange={e => set('priority', e.target.value)}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.dueDate || ''} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-input" value={form.assignedToId || ''} onChange={e => set('assignedToId', e.target.value || null)}>
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {/* Status selector always shown */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['To Do', 'In Progress', 'Done'].map(s => {
                const c = STATUS_CONFIG[s];
                const CIcon = c.icon;
                const active = (form.status || 'To Do') === s;
                return (
                  <button key={s} type="button" onClick={() => set('status', s)}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: `2px solid ${active ? c.border : 'var(--border-color)'}`, background: active ? c.bg : 'white', color: active ? c.color : 'var(--text-secondary)', fontWeight: active ? 700 : 500, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}>
                    <CIcon size={14} />{s}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ── */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetchWithAuth(`/projects/${id}`);
      setProject(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async (form) => {
    const payload = { ...form, projectId: id };
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.assignedToId) delete payload.assignedToId;
    const res = await fetchWithAuth('/tasks', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) { setShowTaskModal(false); fetchProject(); }
  };

  const handleEditTask = async (form) => {
    const payload = { ...form, dueDate: form.dueDate || null, assignedToId: form.assignedToId || null };
    const res = await fetchWithAuth(`/tasks/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (res.ok) { setEditingTask(null); fetchProject(); }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    await fetchWithAuth(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
    setProject(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) }));
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    const res = await fetchWithAuth(`/tasks/${taskId}`, { method: 'DELETE' });
    if (res.ok) setProject(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
  };

  const handleAddMember = async (userId, name) => {
    const res = await fetchWithAuth(`/projects/${id}/members`, { method: 'PUT', body: JSON.stringify({ action: 'add', userId, name }) });
    if (res.ok) { setShowMemberModal(false); fetchProject(); return {}; }
    else { const d = await res.json(); return { error: d.message || 'Failed to add member' }; }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    await fetchWithAuth(`/projects/${id}/members`, { method: 'PUT', body: JSON.stringify({ action: 'remove', userId }) });
    fetchProject();
  };

  const handleUpdateProjectStatus = async (newStatus) => {
    const res = await fetchWithAuth(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    if (res.ok) {
      setProject(prev => ({ ...prev, status: newStatus }));
      setShowStatusModal(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    const res = await fetchWithAuth(`/projects/${id}`, { method: 'DELETE' });
    if (res.ok) navigate('/projects');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p>Loading project…</p>
    </div>
  );
  if (!project) return <div>Project not found.</div>;

  const isAdmin = project.ownerId === user?.id;
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = project.tasks.filter(t => t.status === 'In Progress').length;
  const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  const projectStatus = project.status || 'Not Started';
  const psCfg = PROJECT_STATUS_CONFIG[projectStatus];
  const PsIcon = psCfg.Icon;

  const renderColumn = (status) => {
    const col = project.tasks.filter(t => t.status === status);
    const cfg = STATUS_CONFIG[status];
    const ColIcon = cfg.icon;
    return (
      <div className="kanban-column" style={{ borderTop: `3px solid ${cfg.color}` }}>
        <div className="kanban-header" style={{ color: cfg.color }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ColIcon size={16} />{status}</div>
          <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: '9999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>{col.length}</span>
        </div>
        {col.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', opacity: 0.7 }}>
            <ColIcon size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />No tasks here
          </div>
        )}
        {col.map(task => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
          const assignee = task.assignedTo;
          const canDelete = isAdmin || task.createdById === user?.id;
          return (
            <div key={task.id} className="task-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>
              <div className="flex-between mb-4">
                <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {isAdmin && (
                    <button onClick={() => {
                      const d = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
                      setEditingTask({ ...task, dueDate: d, assignedToId: task.assignedToId || '' });
                    }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '6px' }} title="Edit">
                      <Edit2 size={14} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', borderRadius: '6px' }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <h4 style={{ marginBottom: '6px' }}>{task.title}</h4>
              {task.description && <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>{task.description}</p>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {task.dueDate && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)', background: isOverdue ? '#fef2f2' : 'transparent', padding: isOverdue ? '3px 8px' : '0', borderRadius: '6px', fontWeight: isOverdue ? 600 : 400 }}>
                    <Calendar size={12} />{new Date(task.dueDate).toLocaleDateString()}{isOverdue && ' ⚠'}
                  </div>
                )}
                {assignee && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#3b82f6', background: '#eff6ff', padding: '3px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '9px', fontWeight: 700 }}>
                      {assignee.name[0].toUpperCase()}
                    </div>
                    {assignee.name}
                  </div>
                )}
              </div>
              {/* Status toggle */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                {['To Do', 'In Progress', 'Done'].map(s => {
                  const c = STATUS_CONFIG[s]; const CIcon = c.icon; const active = task.status === s;
                  return (
                    <button key={s} onClick={() => handleUpdateStatus(task.id, s)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '20px', border: `1.5px solid ${active ? c.border : 'var(--border-color)'}`, background: active ? c.bg : 'transparent', color: active ? c.color : 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <CIcon size={10} />{s === 'In Progress' ? 'Progress' : s}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex-between mb-4" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ marginBottom: 0 }}>{project.name}</h1>
            {/* Project status badge — clickable for admin */}
            <button
              onClick={isAdmin ? () => setShowStatusModal(true) : undefined}
              title={isAdmin ? 'Click to change project status' : projectStatus}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', background: psCfg.bg, color: psCfg.color, border: `1.5px solid ${psCfg.border}`, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: isAdmin ? 'pointer' : 'default', boxShadow: `0 0 0 4px ${psCfg.bg}` }}>
              <PsIcon size={13} />
              {projectStatus}
              {isAdmin && <ChevronDown size={12} />}
            </button>
          </div>
          <p className="subtitle" style={{ marginBottom: '16px' }}>{project.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '480px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#3b82f6,#6366f1)', borderRadius: '9999px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span><span style={{ color: '#10b981', fontWeight: 700 }}>{doneTasks}</span> of {totalTasks} tasks done{inProgressTasks > 0 && <span style={{ marginLeft: '10px', color: '#f59e0b', fontWeight: 600 }}>· {inProgressTasks} in progress</span>}</span>
                <span style={{ fontWeight: 700, color: pct === 100 ? '#10b981' : 'var(--text-primary)' }}>{pct}%</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {isAdmin && <button className="btn btn-danger" onClick={handleDeleteProject}><Trash2 size={16} /> Delete Project</button>}
          {isAdmin && <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}><UserPlus size={16} /> Add Member</button>}
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}><Plus size={16} /> New Task</button>
        </div>
      </div>

      {/* Kanban */}
      <div className="kanban-board mt-4">
        {renderColumn('To Do')}
        {renderColumn('In Progress')}
        {renderColumn('Done')}
      </div>

      {/* Team Members */}
      <div className="glass-panel mt-4" style={{ padding: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Layers size={16} /> Team Members</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
          {project.members.map(member => (
            <div key={member.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                {member.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {member.name}
                  {member.id === project.ownerId && <span className="badge badge-high" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>Admin</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>ID: {member.id}</div>
              </div>
              {isAdmin && member.id !== project.ownerId && (
                <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleRemoveMember(member.id)} title="Remove">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={{ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assignedToId: '' }}
          members={project.members}
          onSubmit={handleCreateTask}
          onClose={() => setShowTaskModal(false)}
          isEdit={false}
        />
      )}
      {editingTask && (
        <TaskModal
          task={editingTask}
          members={project.members}
          onSubmit={handleEditTask}
          onClose={() => setEditingTask(null)}
          isEdit={true}
        />
      )}
      {showMemberModal && (
        <AddMemberModal
          members={project.members}
          onAdd={handleAddMember}
          onClose={() => setShowMemberModal(false)}
        />
      )}
      {showStatusModal && (
        <EditStatusModal
          currentStatus={projectStatus}
          onSave={handleUpdateProjectStatus}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default ProjectDetails;
