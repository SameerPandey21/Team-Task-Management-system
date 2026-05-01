import React, { useState, useEffect, useContext } from 'react';
import { fetchWithAuth } from '../utils/api';
import {
  CheckCircle, Clock, ListTodo, AlertTriangle, Zap, FolderDot,
  CheckCircle2, Circle, Layers, TrendingUp
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PROJECT_STATUS_STYLE = {
  'Not Started': { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', Icon: Circle },
  'In Progress': { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', Icon: Clock },
  'Completed':   { color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', Icon: CheckCircle2 },
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchWithAuth('/dashboard');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return (
    <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p>Loading your workspace...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const projectsByStatus = stats?.projectsByStatus || { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 };
  const totalProjects = (stats?.projects || []).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1>{getGreeting()}, {user?.name.split(' ')[0]} 👋</h1>
        <p className="subtitle">Here's what's happening with your projects today.</p>
      </div>

      {/* Task Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="flex-between">
            <span className="stat-label">Total Tasks</span>
            <ListTodo size={24} color="var(--accent-color)" />
          </div>
          <span className="stat-value">{stats?.totalTasks || 0}</span>
        </div>

        <div className="glass-card stat-card">
          <div className="flex-between">
            <span className="stat-label">In Progress</span>
            <Clock size={24} color="var(--warning-color)" />
          </div>
          <span className="stat-value">{stats?.tasksByStatus?.['In Progress'] || 0}</span>
        </div>

        <div className="glass-card stat-card">
          <div className="flex-between">
            <span className="stat-label">Completed Tasks</span>
            <CheckCircle size={24} color="var(--success-color)" />
          </div>
          <span className="stat-value">{stats?.tasksByStatus?.['Done'] || 0}</span>
        </div>

        <div className="glass-card stat-card">
          <div className="flex-between">
            <span className="stat-label">Overdue Tasks</span>
            <AlertTriangle size={24} color="var(--danger-color)" />
          </div>
          <span className="stat-value" style={{ color: 'var(--danger-color)' }}>{stats?.overdueTasks || 0}</span>
        </div>
      </div>

      {/* Project Status Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {['Not Started', 'In Progress', 'Completed'].map(status => {
          const ss = PROJECT_STATUS_STYLE[status];
          const StatusIcon = ss.Icon;
          const count = projectsByStatus[status] || 0;
          return (
            <div key={status} className="glass-card" style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              borderLeft: `4px solid ${ss.color}`,
              padding: '20px 24px'
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: ss.bg, border: `1.5px solid ${ss.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: ss.color, flexShrink: 0
              }}>
                <StatusIcon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1, color: ss.color }}>{count}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                  {status === 'Not Started' ? 'Not Started' : status} {count === 1 ? 'Project' : 'Projects'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Your Projects */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div className="flex-between mb-4">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} /> Your Projects
            </h3>
            <Link to="/projects" style={{ fontSize: '0.82rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {totalProjects === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              <FolderDot size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>No projects yet. Create one to get started.</p>
              <Link to="/projects" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '16px', display: 'inline-flex' }}>
                Create a Project
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(stats?.projects || []).map(project => {
                const ss = PROJECT_STATUS_STYLE[project.status];
                const StatusIcon = ss.Icon;
                const pct = project.totalTasks === 0 ? 0 : Math.round((project.doneTasks / project.totalTasks) * 100);
                return (
                  <Link to={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                    <div className="activity-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="activity-icon">
                          <FolderDot size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {project.name}
                          </div>
                          <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>
                            {project.totalTasks} task{project.totalTasks !== 1 ? 's' : ''} · {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 10px', borderRadius: '9999px',
                          background: ss.bg, color: ss.color,
                          border: `1.5px solid ${ss.border}`,
                          fontSize: '0.7rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          whiteSpace: 'nowrap', flexShrink: 0
                        }}>
                          <StatusIcon size={10} />
                          {project.status}
                        </span>
                      </div>
                      {project.totalTasks > 0 && (
                        <div>
                          <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%',
                              background: pct === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                              borderRadius: '9999px', transition: 'width 0.6s ease'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Overview + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div className="flex-between mb-4">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} /> Your Overview
              </h3>
              <Zap size={18} color="var(--warning-color)" />
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <ListTodo size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Personal Workload</h4>
                  <p style={{ margin: 0, fontSize: '0.83rem' }}>
                    You have <strong>{stats?.myTasks || 0}</strong> tasks assigned directly to you.
                  </p>
                </div>
              </div>
              {stats?.totalTasks === 0 && (
                <div className="activity-item" style={{ background: '#fef2f2', borderColor: '#fee2e2' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--danger-color)' }}>No active tasks</h4>
                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--danger-color)' }}>Join a project or create one to start collaborating.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div className="flex-between mb-4">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderDot size={16} /> Quick Actions
              </h3>
            </div>
            <p style={{ marginBottom: '20px', fontSize: '0.88rem' }}>Navigate quickly to your workspace areas.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/projects" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Projects</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
