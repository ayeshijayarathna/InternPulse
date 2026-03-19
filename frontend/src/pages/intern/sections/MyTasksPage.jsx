import { useEffect, useState } from 'react';
import {
  FiCheckSquare, FiClock, FiAlertTriangle, FiRefreshCw, FiFilter
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const PRIORITY_COLOR = {
  high:   'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low:    'var(--priority-low)',
};

const STATUS_META = {
  pending:     { color: 'var(--status-pending)',     bg: 'rgba(148,163,184,0.1)', label: 'Pending'     },
  'in-progress':{ color: 'var(--status-in-progress)', bg: 'rgba(249,115,22,0.1)', label: 'In Progress' },
  completed:   { color: 'var(--status-completed)',   bg: 'rgba(34,197,94,0.1)',   label: 'Completed'   },
};

export default function MyTasksPage() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all'); // all | pending | in-progress | completed

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/tasks/my');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const now      = new Date();
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const isOverdue = (task) =>
    task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed';

  const filterTabs = [
    { id: 'all',         label: 'All',         count: tasks.length },
    { id: 'pending',     label: 'Pending',     count: tasks.filter(t => t.status === 'pending').length },
    { id: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { id: 'completed',   label: 'Completed',   count: tasks.filter(t => t.status === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            My Tasks
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {tasks.length} tasks assigned to you
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="p-2 rounded-xl border transition-all hover:bg-white/5"
          style={{ borderColor: 'var(--border)' }}
        >
          <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: filter === tab.id
                ? 'linear-gradient(135deg, var(--intern-primary), var(--intern-secondary))'
                : 'var(--bg-card)',
              color:      filter === tab.id ? '#fff' : 'var(--text-secondary)',
              border:     `1px solid ${filter === tab.id ? 'transparent' : 'var(--border)'}`,
            }}
          >
            <FiFilter className="w-3 h-3" />
            {tab.label}
            <span className="ml-0.5 opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
               style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-12 text-center"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiCheckSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const overdue = isOverdue(task);
            const statusMeta = STATUS_META[task.status] || STATUS_META.pending;

            return (
              <div
                key={task._id}
                className="rounded-2xl border p-5 transition-all hover:border-[var(--intern-primary)]/40"
                style={{
                  background:   'var(--bg-card)',
                  borderColor:  overdue ? 'rgba(239,68,68,0.4)' : 'var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{task.title}</span>
                      {overdue && (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded"
                              style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
                          <FiAlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {/* Priority */}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded capitalize"
                            style={{
                              color:      PRIORITY_COLOR[task.priority],
                              background: `${PRIORITY_COLOR[task.priority]}22`,
                            }}>
                        {task.priority}
                      </span>

                      {/* Status */}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{ color: statusMeta.color, background: statusMeta.bg }}>
                        {statusMeta.label}
                      </span>

                      {/* Due date */}
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-xs"
                              style={{ color: overdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                          <FiClock className="w-3 h-3" />
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}