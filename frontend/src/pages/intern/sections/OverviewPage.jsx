import { useEffect, useState } from 'react';
import { FiCheckSquare, FiClock, FiAlertCircle, FiFileText, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

export default function OverviewPage({ setActiveTab }) {
  const [tasks, setTasks]             = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, subsRes] = await Promise.all([
          axiosInstance.get('/tasks/my'),
          axiosInstance.get('/updates/my'),
        ]);
        setTasks(tasksRes.data);
        setSubmissions(subsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgress     = tasks.filter(t => t.status === 'in-progress').length;
  const pending        = tasks.filter(t => t.status === 'pending').length;
  const totalSubs      = submissions.length;
  const blockers       = submissions.filter(s => s.type === 'blocker').length;

  // Overdue tasks
  const now     = new Date();
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length;

  const statCards = [
    {
      label:  'Total Tasks',
      value:  totalTasks,
      icon:   FiCheckSquare,
      color:  'var(--intern-primary)',
      glow:   'var(--intern-glow)',
      sub:    `${completedTasks} completed`,
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon:  FiTrendingUp,
      color: 'var(--status-in-progress)',
      glow:  'rgba(249,115,22,0.3)',
      sub:   `${pending} pending`,
    },
    {
      label: 'Overdue',
      value: overdue,
      icon:  FiClock,
      color: 'var(--danger)',
      glow:  'rgba(239,68,68,0.3)',
      sub:   'Need attention',
    },
    {
      label: 'Submissions',
      value: totalSubs,
      icon:  FiFileText,
      color: 'var(--success)',
      glow:  'rgba(34,197,94,0.3)',
      sub:   `${blockers} blockers`,
    },
  ];

  const recentTasks = tasks.slice(0, 4);

  const priorityColor = (p) => ({
    high:   'var(--priority-high)',
    medium: 'var(--priority-medium)',
    low:    'var(--priority-low)',
  }[p] || 'var(--text-secondary)');

  const statusColor = (s) => ({
    completed:   'var(--status-completed)',
    'in-progress': 'var(--status-in-progress)',
    pending:     'var(--status-pending)',
  }[s] || 'var(--text-secondary)');

  const statusBg = (s) => ({
    completed:   'rgba(34,197,94,0.1)',
    'in-progress': 'rgba(249,115,22,0.1)',
    pending:     'rgba(148,163,184,0.1)',
  }[s] || 'transparent');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Overview
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Here's a summary of your work
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label}
                 className="p-5 rounded-2xl border relative overflow-hidden"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {/* Glow blob */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30"
                   style={{ background: card.glow }} />
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg"
                     style={{ background: `${card.color}22` }}>
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1"
                   style={{ fontFamily: 'var(--font-display)' }}>
                {card.value}
              </div>
              <div className="text-xs font-semibold text-white/80">{card.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      <div className="rounded-2xl border overflow-hidden"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Recent Tasks
          </h3>
          <button onClick={() => setActiveTab('tasks')}
                  className="flex items-center gap-1 text-xs font-semibold transition-colors"
                  style={{ color: 'var(--intern-accent)' }}>
            View all <FiArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="px-6 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
            No tasks assigned yet
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentTasks.map((task) => (
              <div key={task._id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{task.title}</div>
                  {task.dueDate && (
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Priority dot */}
                  <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded"
                        style={{
                          color:      priorityColor(task.priority),
                          background: `${priorityColor(task.priority)}22`,
                        }}>
                    {task.priority}
                  </span>
                  {/* Status badge */}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded capitalize"
                        style={{
                          color:      statusColor(task.status),
                          background: statusBg(task.status),
                        }}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('submit')}
          className="group p-5 rounded-2xl border text-left transition-all hover:border-[var(--intern-primary)]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ background: 'var(--intern-primary)22' }}>
              <FiFileText className="w-5 h-5" style={{ color: 'var(--intern-accent)' }} />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Submit Update
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Post progress, blockers, or a self-task
          </p>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className="group p-5 rounded-2xl border text-left transition-all hover:border-[var(--intern-primary)]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
              <FiAlertCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              My History
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            View all your past submissions
          </p>
        </button>
      </div>
    </div>
  );
}