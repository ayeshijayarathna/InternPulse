import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const COLORS = ['#dc2626', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs font-medium shadow-xl border"
         style={{ background: '#1e1e2e', borderColor: '#333', color: '#fff' }}>
      <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export default function ChartsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/super-admin/analytics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: '#dc2626', borderTopColor: '#f59e0b' }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        Failed to load analytics data
      </div>
    );
  }

  const roleDistribution = [
    { name: 'Supervisors', value: data.users.totalSupervisors },
    { name: 'Interns', value: data.users.totalInterns },
    { name: 'Super Admin', value: 1 },
  ];

  const taskStatusData = [
    { name: 'Pending', value: data.tasks.pendingTasks, color: '#f59e0b' },
    { name: 'In Progress', value: data.tasks.inProgressTasks, color: '#3b82f6' },
    { name: 'Completed', value: data.tasks.completedTasks, color: '#22c55e' },
  ];

  const taskPriorityData = [
    { name: 'Low', value: data.tasksByPriority.low },
    { name: 'Medium', value: data.tasksByPriority.medium },
    { name: 'High', value: data.tasksByPriority.high },
  ];

  const inquiryStatusData = [
    { name: 'Open', value: data.inquiries.openInquiries },
    { name: 'Replied', value: data.inquiries.repliedInquiries },
    { name: 'Closed', value: data.inquiries.closedInquiries },
  ];

  const accountStatusData = [
    { name: 'Active Supervisors', value: data.users.activeSupervisors, fill: '#22c55e' },
    { name: 'Inactive Supervisors', value: data.users.inactiveSupervisors, fill: '#ef4444' },
    { name: 'Active Interns', value: data.users.activeInterns, fill: '#3b82f6' },
    { name: 'Inactive Interns', value: data.users.inactiveInterns, fill: '#f97316' },
  ];

  const engagementData = [
    { metric: 'Tasks', value: data.tasks.totalTasks, icon: '📋' },
    { metric: 'Updates', value: data.updates.totalUpdates, icon: '📝' },
    { metric: 'Announcements', value: data.announcements.totalAnnouncements, icon: '📢' },
    { metric: 'Inquiries', value: data.inquiries.totalInquiries, icon: '💬' },
    { metric: 'Notifications', value: data.notifications.totalNotifications, icon: '🔔' },
    { metric: 'Required Days', value: data.requiredDays.totalRequiredDays, icon: '📅' },
  ];

  const chartCard = (title, icon, children, gridSpan = '') => (
    <div className={`rounded-2xl border overflow-hidden ${gridSpan}`}
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b flex items-center gap-2"
           style={{ borderColor: 'var(--border)' }}>
        <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(245,158,11,0.15))' }}>
          {icon}
        </div>
        <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Analytics & Charts
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Visual insights across the platform
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data.users.total, color: '#dc2626' },
          { label: 'Total Tasks', value: data.tasks.totalTasks, color: '#f59e0b' },
          { label: 'Total Inquiries', value: data.inquiries.totalInquiries, color: '#3b82f6' },
          { label: 'Unread Alerts', value: data.notifications.unreadNotifications, color: '#8b5cf6' },
        ].map(card => (
          <div key={card.label} className="p-4 rounded-2xl border relative overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-2xl opacity-20"
                 style={{ background: card.color }} />
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {card.value}
            </div>
            <div className="text-xs font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Interns per Supervisor (Bar) */}
        {chartCard('Interns per Supervisor', <FiBarChart2 className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.internsPerSupervisor} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="interns" name="Interns" radius={[6, 6, 0, 0]}>
                {data.internsPerSupervisor.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 2. Role Distribution (Pie) */}
        {chartCard('Role Distribution', <FiPieChart className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                   paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {roleDistribution.map((_, i) => (
                  <Cell key={i} fill={['#dc2626', '#f59e0b', '#8b5cf6'][i]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* 3. Task Status (Pie) */}
        {chartCard('Task Status Breakdown', <FiPieChart className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                   paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {taskStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* 4. Task Priority (Bar) */}
        {chartCard('Task Priority Distribution', <FiBarChart2 className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskPriorityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 11 }} />
              <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                <Cell fill="#22c55e" />
                <Cell fill="#f59e0b" />
                <Cell fill="#dc2626" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 5. Inquiry Status (Pie) */}
        {chartCard('Inquiry Status', <FiPieChart className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={inquiryStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                   paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                <Cell fill="#f59e0b" />
                <Cell fill="#3b82f6" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* 6. Account Status (Bar) */}
        {chartCard('Account Status Overview', <FiActivity className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={accountStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#999', fontSize: 10 }} width={130} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
                {accountStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 7. Engagement Radar */}
        {chartCard('Platform Engagement', <FiActivity className="w-4 h-4" style={{ color: '#dc2626' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={engagementData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#999', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#666', fontSize: 10 }} />
              <Radar name="Platform" dataKey="value" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {/* 8. Inquiry Timeline (Area) */}
        {chartCard('Inquiry Trend (30 Days)', <FiTrendingUp className="w-4 h-4" style={{ color: '#dc2626' }} />,
          data.inquiryTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.inquiryTimeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 10 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
                <Area type="monotone" dataKey="open" name="Open" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Area type="monotone" dataKey="replied" name="Replied" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Area type="monotone" dataKey="closed" name="Closed" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No inquiry data in the last 30 days
            </div>
          )
        )}
      </div>
    </div>
  );
}
