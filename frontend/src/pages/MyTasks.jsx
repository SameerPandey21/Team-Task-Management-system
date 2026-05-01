import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/api';
import { CheckSquare, Calendar, Clock, CheckCircle2, Circle, Filter, FolderDot } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const STATUS_CONFIG = {
  'To Do':      { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', Icon: Circle },
  'In Progress':{ color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  'Done':       { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', Icon: CheckCircle2 },
};

const PRIORITY_COLOR = {
  High:   { color: '#dc2626', bg: '#fef2f2' },
  Medium: { color: '#d97706', bg: '#fffbeb' },
  Low:    { color: '#16a34a', bg: '#f0fdf4' },
};

const MyTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | todo | progress | done

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const res = await fetchWithAuth('/dashboard');
      const data = await res.json();

      // Fetch all project details to get full task info for my tasks
      const allProjects = data.projects || [];
      const projectDetailsPromises = allProjects.map(p =>
        fetchWithAuth(`/projects/${p.id}`).then(r => r.json())
      );
      const projectDetails = await Promise.all(projectDetailsPromises);

      // Collect tasks assigned to me across all projects
      const myTasks = [];
      projectDetails.forEach(project => {
        if (!project.tasks) return;
        project.tasks.forEach(task => {
          if (task.assignedToId === user?.id) {
            myTasks.push({ ...task, projectName: project.name, projectId: project.id });
          }
        });
      });
      setTasks(myTasks);
    } catch (err) {
      console.error('Failed to load my tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await fetchWithAuth(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) { console.error(err); }
  };

  const filtered = tasks.filter(t => {
    if (filter === 'todo') return t.status === 'To Do';
    if (filter === 'progress') return t.status === 'In Progress';
    if (filter === 'done') return t.status === 'Done';
    return true;
  });

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    progress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p>Loading your tasks...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckSquare size={28} /> My Tasks
        </h1>
        <p className="subtitle">All tasks assigned to you across your projects.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0' }}>
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'todo', label: 'To Do' },
          { key: 'progress', label: 'In Progress' },
          { key: 'done', label: 'Done' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: filter === key ? '2px solid var(--accent-color)' : '2px solid transparent',
              background: 'transparent',
              color: filter === key ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: filter === key ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '-1px',
            }}
          >
            {label}
            <span style={{
              background: filter === key ? 'var(--accent-color)' : '#e2e8f0',
              color: filter === key ? 'white' : 'var(--text-secondary)',
              borderRadius: '9999px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700,
            }}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-secondary)' }}>
          <CheckSquare size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 0 }}>
            {filter === 'all' ? 'No tasks assigned to you' : `No ${filter === 'todo' ? 'To Do' : filter === 'progress' ? 'In Progress' : 'Done'} tasks`}
          </h3>
          <p style={{ marginTop: '8px' }}>
            {filter === 'all' ? 'Ask a project admin to assign you tasks.' : 'Switch filter to see other tasks.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((task, idx) => {
            const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG['To Do'];
            const pc = PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.Medium;
            const StatusIcon = sc.Icon;
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

            return (
              <div
                key={task.id}
                className="glass-card"
                style={{ padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start', animationDelay: `${idx * 0.04}s` }}
              >
                {/* Status dot */}
                <div style={{ marginTop: '2px', flexShrink: 0 }}>
                  <StatusIcon size={20} color={sc.color} />
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ marginBottom: '4px', fontSize: '0.97rem' }}>{task.title}</h4>
                      <Link to={`/projects/${task.projectId}`} style={{ textDecoration: 'none' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                          <FolderDot size={13} /> {task.projectName}
                        </span>
                      </Link>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, background: pc.bg, color: pc.color }}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.78rem',
                          color: isOverdue ? 'var(--danger-color)' : 'var(--text-secondary)',
                          background: isOverdue ? '#fef2f2' : 'transparent',
                          padding: isOverdue ? '3px 8px' : '0',
                          borderRadius: '6px',
                          fontWeight: isOverdue ? 600 : 400,
                        }}>
                          <Calendar size={13} />
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue && ' ⚠'}
                        </span>
                      )}
                    </div>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                      {task.description}
                    </p>
                  )}

                  {/* Status quick-change */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                    {['To Do', 'In Progress', 'Done'].map(s => {
                      const c = STATUS_CONFIG[s];
                      const CIcon = c.Icon;
                      const isActive = task.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => handleUpdateStatus(task.id, s)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '5px 10px', borderRadius: '20px',
                            border: `1.5px solid ${isActive ? c.border : 'var(--border-color)'}`,
                            background: isActive ? c.bg : 'transparent',
                            color: isActive ? c.color : 'var(--text-secondary)',
                            fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer', transition: 'all 0.2s',
                            transform: isActive ? 'scale(1.04)' : 'scale(1)',
                          }}
                        >
                          <CIcon size={11} />
                          {s === 'In Progress' ? 'Progress' : s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
