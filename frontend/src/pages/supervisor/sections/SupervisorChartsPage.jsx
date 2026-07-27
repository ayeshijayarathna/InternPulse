import { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiUsers, FiFolder, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axiosInstance from '../../../api/axiosInstance';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent === 0) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border p-3 shadow-xl"
           style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SupervisorChartsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/analytics/supervisor')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--text-secondary)' }}>Failed to load analytics data</p>
      </div>
    );
  }

  const { overview, tasksByMonth, submissionsByIntern, projectProgress, dailyActivity, taskStatusDistribution, priorityDistribution, projectStatusDistribution } = data;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, var(--supervisor-primary), var(--supervisor-secondary))' }}>
          <FiBarChart2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Analytics</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track your dashboard performance</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: overview.totalTasks, icon: FiCheckCircle, color: '#3b82f6' },
          { label: 'Completed', value: overview.completedTasks, icon: FiCheckCircle, color: '#10b981' },
          { label: 'Pending', value: overview.pendingTasks, icon: FiClock, color: '#f59e0b' },
          { label: 'Overdue', value: overview.overdueTasks, icon: FiAlertTriangle, color: '#ef4444' },
          { label: 'Submissions', value: overview.totalSubmissions, icon: FiTrendingUp, color: '#8b5cf6' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Tasks & Submissions Trend */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Tasks & Submissions Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tasksByMonth}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="tasks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTasks)" name="Tasks" />
              <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSubs)" name="Submissions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Completion Trend */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Task Completion Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tasksByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Completed" />
              <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Created" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Submissions by Intern */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Submissions by Intern</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={submissionsByIntern}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="submissions" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Submissions" />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Tasks Assigned" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Progress */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Project Progress</h3>
          {projectProgress.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-sm" style={{ color: 'var(--text-muted)' }}>
              No projects yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projectProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="progress" radius={[0, 6, 6, 0]} name="Progress %">
                  {projectProgress.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || '#7c3aed'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row: Pie charts + Daily Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Daily Activity */}
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Activity (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} interval={4} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Tasks" />
              <Bar dataKey="submissions" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Task Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={taskStatusDistribution} cx="50%" cy="50%" outerRadius={90}
                   labelLine={false} label={renderCustomizedLabel} dataKey="value">
                {taskStatusDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority + Project Status Pies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityDistribution} cx="50%" cy="50%" outerRadius={80}
                   labelLine={false} label={renderCustomizedLabel} dataKey="value">
                {priorityDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border p-5" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Project Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={projectStatusDistribution} cx="50%" cy="50%" outerRadius={80}
                   labelLine={false} label={renderCustomizedLabel} dataKey="value">
                {projectStatusDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
