import { useState, useEffect } from 'react';
import { 
  FiUsers, FiCheckSquare, FiFileText, FiTrendingUp, 
  FiAlertCircle, FiClock, FiActivity, FiBarChart2 
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

export default function OverviewPage() {
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeInterns: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    totalSubmissions: 0,
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [internsRes, tasksRes, submissionsRes] = await Promise.all([
        axiosInstance.get('/users/interns'),
        axiosInstance.get('/tasks'),
        axiosInstance.get('/updates')
      ]);

      const interns = internsRes.data;
      const tasks = tasksRes.data;
      const submissions = submissionsRes.data;

      setStats({
        totalInterns: interns.length,
        activeInterns: interns.filter(i => i.isActive).length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length,
        inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
        totalSubmissions: submissions.length,
        recentSubmissions: submissions.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.totalTasks > 0 
    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-[var(--admin-primary)] border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] flex items-center justify-center">
          <FiActivity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Dashboard Overview
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Quick overview of your intern management system
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interns */}
        <div className="p-5 rounded-2xl border hover:border-[var(--admin-primary)] transition-all group" 
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiUsers className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.totalInterns}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {stats.activeInterns} active
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-[var(--text-secondary)]">Total Interns</div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
              style={{ width: `${stats.totalInterns > 0 ? (stats.activeInterns / stats.totalInterns * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="p-5 rounded-2xl border hover:border-[var(--admin-primary)] transition-all group" 
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiCheckSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.totalTasks}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {completionRate}% completed
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-[var(--text-secondary)]">Total Tasks</div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="p-5 rounded-2xl border hover:border-[var(--admin-primary)] transition-all group" 
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiClock className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.pendingTasks}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {stats.inProgressTasks} in progress
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-[var(--text-secondary)]">Pending Tasks</div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
              style={{ width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks * 100) : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="p-5 rounded-2xl border hover:border-[var(--admin-primary)] transition-all group" 
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiFileText className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.totalSubmissions}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">
                all time
              </div>
            </div>
          </div>
          <div className="text-sm font-semibold text-[var(--text-secondary)]">Submissions</div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 w-full"></div>
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-6">
            <FiBarChart2 className="w-5 h-5 text-[var(--admin-primary)]" />
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Task Status Breakdown
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Completed', value: stats.completedTasks, color: '#22c55e', total: stats.totalTasks },
              { label: 'In Progress', value: stats.inProgressTasks, color: '#f97316', total: stats.totalTasks },
              { label: 'Pending', value: stats.pendingTasks, color: '#94a3b8', total: stats.totalTasks }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">{item.label}</span>
                  <span className="text-sm font-bold text-white">{item.value} tasks</span>
                </div>
                <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all rounded-full"
                    style={{ 
                      background: item.color,
                      width: `${item.total > 0 ? (item.value / item.total * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-6">
            <FiTrendingUp className="w-5 h-5 text-[var(--admin-primary)]" />
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Quick Stats
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Active Interns', value: stats.activeInterns, icon: FiUsers, color: '#3b82f6' },
              { label: 'Task Completion', value: `${completionRate}%`, icon: FiCheckSquare, color: '#22c55e' },
              { label: 'Avg per Intern', value: stats.activeInterns > 0 ? (stats.totalTasks / stats.activeInterns).toFixed(1) : 0, icon: FiActivity, color: '#f59e0b' },
              { label: 'Total Updates', value: stats.totalSubmissions, icon: FiFileText, color: '#a78bfa' }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <stat.icon className="w-5 h-5 mb-3" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-6">
          <FiFileText className="w-5 h-5 text-[var(--admin-primary)]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Recent Submissions
          </h3>
        </div>
        {stats.recentSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <FiAlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentSubmissions.map((submission) => (
              <div 
                key={submission._id}
                className="flex items-start gap-4 p-4 rounded-xl border hover:border-[var(--admin-primary)] transition-all"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  submission.type === 'blocker' ? 'bg-red-500/10' :
                  submission.type === 'self_task' ? 'bg-green-500/10' : 'bg-blue-500/10'
                }`}>
                  {submission.type === 'blocker' ? (
                    <FiAlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <FiFileText className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">
                      {submission.createdBy?.name || 'Unknown'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      submission.type === 'blocker' ? 'bg-red-500/10 text-red-400' :
                      submission.type === 'self_task' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {submission.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                    {submission.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                    <span>{new Date(submission.createdAt).toLocaleString()}</span>
                    {submission.taskId && (
                      <span>• Task: {submission.taskId.title}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}