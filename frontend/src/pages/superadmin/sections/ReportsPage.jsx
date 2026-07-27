import { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiUsers, FiUserCheck, FiGitBranch, FiClipboard, FiFile } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const reports = [
  {
    id: 'full',
    title: 'Full System Report',
    description: 'Complete system summary including users, tasks, inquiries, announcements, and engagement metrics.',
    icon: FiFile,
    endpoint: '/super-admin/reports/full',
    color: '#dc2626',
  },
  {
    id: 'supervisors',
    title: 'Supervisors Report',
    description: 'All supervisors with their email, status, intern count, and creation date.',
    icon: FiUserCheck,
    endpoint: '/super-admin/reports/supervisors',
    color: '#f59e0b',
  },
  {
    id: 'interns',
    title: 'Interns Report',
    description: 'All interns with supervisor assignment, university, hometown, and internship dates.',
    icon: FiUsers,
    endpoint: '/super-admin/reports/interns',
    color: '#3b82f6',
  },
  {
    id: 'hierarchy',
    title: 'Supervisor-Intern Hierarchy',
    description: 'Full organizational tree showing each supervisor with their assigned interns.',
    icon: FiGitBranch,
    endpoint: '/super-admin/reports/hierarchy',
    color: '#8b5cf6',
  },
  {
    id: 'tasks',
    title: 'Tasks Report',
    description: 'All tasks with status, priority, assignees, due dates, and creation info.',
    icon: FiClipboard,
    endpoint: '/super-admin/reports/tasks',
    color: '#22c55e',
  },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance.get('/super-admin/analytics')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  const handleDownload = async (report) => {
    setDownloading(report.id);
    try {
      const response = await axiosInstance.get(report.endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.id}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Reports & Downloads
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Export platform data as CSV files
        </p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Supervisors', value: stats.users.totalSupervisors, color: '#f59e0b' },
            { label: 'Interns', value: stats.users.totalInterns, color: '#3b82f6' },
            { label: 'Tasks', value: stats.tasks.totalTasks, color: '#22c55e' },
            { label: 'Announcements', value: stats.announcements.totalAnnouncements, color: '#8b5cf6' },
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
      )}

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.id;
          return (
            <div key={report.id}
                 className="group rounded-2xl border p-6 transition-all hover:scale-[1.01]"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl shrink-0" style={{ background: `${report.color}18` }}>
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                    {report.title}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {report.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(135deg, ${report.color}, ${report.color}cc)` }}>
                      {isDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-3.5 h-3.5" />
                          Download CSV
                        </>
                      )}
                    </button>
                    <span className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background: `${report.color}15`, color: report.color }}>
                      CSV Format
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="rounded-2xl border p-5 flex items-start gap-3"
           style={{ background: 'rgba(220,38,38,0.05)', borderColor: 'rgba(220,38,38,0.2)' }}>
        <FiFileText className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
        <div>
          <p className="text-xs font-semibold text-white">About Reports</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            All reports are generated in real-time from the current database state and exported as CSV files.
            The Full System Report includes a comprehensive summary with user counts, task statistics,
            inquiry status, and detailed supervisor-intern breakdowns.
          </p>
        </div>
      </div>
    </div>
  );
}
