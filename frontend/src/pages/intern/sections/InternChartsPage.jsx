import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity, FiTarget } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const COLORS = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899', '#f97316'];

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

export default function InternChartsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/users/my-analytics')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: 'var(--intern-primary)', borderTopColor: 'transparent' }} />
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

  const taskStatusData = [
    { name: 'Pending', value: data.tasks.pendingTasks, color: '#f59e0b' },
    { name: 'In Progress', value: data.tasks.inProgressTasks, color: '#3b82f6' },
    { name: 'Completed', value: data.tasks.completedTasks, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const taskPriorityData = [
    { name: 'Low', value: data.tasksByPriority.low },
    { name: 'Medium', value: data.tasksByPriority.medium },
    { name: 'High', value: data.tasksByPriority.high },
  ].filter(d => d.value > 0);

  const updateTypeData = [
    { name: 'Updates', value: data.updates.updateCount, color: '#8b5cf6' },
    { name: 'Blockers', value: data.updates.blockerCount, color: '#ef4444' },
    { name: 'Self Tasks', value: data.updates.selfTaskCount, color: '#06b6d4' },
  ].filter(d => d.value > 0);

  const inquiryStatusData = [
    { name: 'Open', value: data.inquiries.openInquiries, color: '#f59e0b' },
    { name: 'Replied', value: data.inquiries.repliedInquiries, color: '#3b82f6' },
    { name: 'Closed', value: data.inquiries.closedInquiries, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const attendanceData = [
    { name: 'Confirmed', value: data.requiredDays.confirmedDays, color: '#22c55e' },
    { name: 'Unavailable', value: data.requiredDays.unavailableDays, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const performanceRadar = [
    { metric: 'Task Completion', value: data.performance.taskCompletionRate },
    { metric: 'Submissions', value: data.performance.submissionScore },
    { metric: 'Attendance', value: data.performance.attendanceScore },
    { metric: 'Overall', value: data.performance.overallScore },
  ];

  const engagementData = [
    { metric: 'Tasks', value: data.tasks.totalTasks, icon: '📋' },
    { metric: 'Submissions', value: data.updates.totalUpdates, icon: '📝' },
    { metric: 'Inquiries', value: data.inquiries.totalInquiries, icon: '💬' },
    { metric: 'Office Days', value: data.requiredDays.totalRequiredDays, icon: '📅' },
    { metric: 'Notifications', value: data.notifications.totalNotifications, icon: '🔔' },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const chartCard = (title, icon, children) => (
    <div className="rounded-2xl border overflow-hidden"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="px-5 py-4 border-b flex items-center gap-2"
           style={{ borderColor: 'var(--border)' }}>
        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)' }}>
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
          My Performance Analytics
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track your progress and engagement across the platform
        </p>
      </div>

      {/* Performance Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Task Completion', value: `${data.performance.taskCompletionRate}%`, color: getScoreColor(data.performance.taskCompletionRate) },
          { label: 'Submission Score', value: `${data.performance.submissionScore}%`, color: getScoreColor(data.performance.submissionScore) },
          { label: 'Attendance Rate', value: `${data.performance.attendanceScore}%`, color: getScoreColor(data.performance.attendanceScore) },
          { label: 'Overall Score', value: `${data.performance.overallScore}%`, color: getScoreColor(data.performance.overallScore) },
        ].map(card => (
          <div key={card.label} className="p-4 rounded-2xl border relative overflow-hidden"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-2xl opacity-20"
                 style={{ background: card.color }} />
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: card.color }}>
              {card.value}
            </div>
            <div className="text-xs font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'My Tasks', value: data.tasks.totalTasks, color: '#8b5cf6' },
          { label: 'Submissions', value: data.updates.totalUpdates, color: '#06b6d4' },
          { label: 'Inquiries', value: data.inquiries.totalInquiries, color: '#22c55e' },
          { label: 'Office Days', value: data.requiredDays.totalRequiredDays, color: '#f59e0b' },
          { label: 'Unread Alerts', value: data.notifications.unreadNotifications, color: '#ec4899' },
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

        {/* 1. Performance Radar */}
        {chartCard('Performance Overview', <FiTarget className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceRadar} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#999', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#666', fontSize: 10 }} domain={[0, 100]} />
              <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {/* 2. Task Status (Pie) */}
        {chartCard('Task Status Overview', <FiPieChart className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          taskStatusData.length > 0 ? (
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
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No tasks assigned yet
            </div>
          )
        )}

        {/* 3. Task Priority (Bar) */}
        {chartCard('Task Priority Distribution', <FiBarChart2 className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          taskPriorityData.length > 0 ? (
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
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No tasks assigned yet
            </div>
          )
        )}

        {/* 4. Submission Types (Pie) */}
        {chartCard('Submission Breakdown', <FiPieChart className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          updateTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={updateTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                     paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {updateTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No submissions yet
            </div>
          )
        )}

        {/* 5. Submission Timeline (Area) */}
        {chartCard('Submission Activity (30 Days)', <FiTrendingUp className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          data.submissionTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.submissionTimeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradUpdates" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBlockers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 10 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
                <Area type="monotone" dataKey="updates" name="Updates" stroke="#8b5cf6"
                      fill="url(#gradUpdates)" strokeWidth={2} />
                <Area type="monotone" dataKey="blockers" name="Blockers" stroke="#ef4444"
                      fill="url(#gradBlockers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No submissions in the last 30 days
            </div>
          )
        )}

        {/* 6. Task Progress Timeline (Line) */}
        {chartCard('Task Progress Timeline', <FiTrendingUp className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          data.taskProgressTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.taskProgressTimeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" tick={{ fill: '#999', fontSize: 10 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
                <Line type="monotone" dataKey="assigned" name="Assigned" stroke="#f59e0b"
                      strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#22c55e"
                      strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No task data available
            </div>
          )
        )}

        {/* 7. Inquiry Status (Pie) */}
        {chartCard('Inquiry Status', <FiPieChart className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          inquiryStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={inquiryStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                     paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {inquiryStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#ccc' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No inquiries yet
            </div>
          )
        )}

        {/* 8. Attendance (Bar) */}
        {chartCard('Office Day Attendance', <FiBarChart2 className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 11 }} />
                <YAxis tick={{ fill: '#999', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Days" radius={[6, 6, 0, 0]}>
                  {attendanceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>
              No required days scheduled
            </div>
          )
        )}

        {/* 9. Platform Engagement Radar */}
        {chartCard('My Engagement Summary', <FiActivity className="w-4 h-4" style={{ color: '#8b5cf6' }} />,
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={engagementData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#999', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#666', fontSize: 10 }} />
              <Radar name="My Activity" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
