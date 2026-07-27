import { useState, useEffect } from 'react';
import {
  FiFileText, FiUser, FiClock, FiCheckCircle,
  FiDownload, FiPaperclip, FiRefreshCw, FiZap, FiImage, FiFolder
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

const TYPE_META = {
  update:    { label: 'Submission', icon: FiCheckCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' },
  self_task: { label: 'Self Task',  icon: FiZap,         color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
};

const downloadFile = async (filename, originalName) => {
  try {
    const token = localStorage.getItem('token');
    const res   = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${filename}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error('Download failed');
    const blob    = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = blobUrl;
    a.download    = originalName || filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Download error:', err);
    alert('File download failed.');
  }
};

const isImageMime = (mime) => mime?.startsWith('image/');

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [updatesRes, projectsRes] = await Promise.all([
        axiosInstance.get('/updates'),
        axiosInstance.get('/projects'),
      ]);
      setSubmissions(updatesRes.data.filter(s => s.type !== 'blocker'));
      setProjects(projectsRes.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const getProjectForSubmission = (sub) => {
    if (sub.taskId && typeof sub.taskId === 'object' && sub.taskId.projectId) {
      const pid = typeof sub.taskId.projectId === 'object' ? sub.taskId.projectId._id : sub.taskId.projectId;
      return projects.find((p) => p._id === pid) || null;
    }
    return null;
  };

  const filtered = submissions
    .filter((s) => filter === 'all' || s.type === filter)
    .filter((s) => {
      if (projectFilter === 'all') return true;
      const project = getProjectForSubmission(s);
      return project && project._id === projectFilter;
    });

  const counts = {
    all:       submissions.length,
    update:    submissions.filter(s => s.type === 'update').length,
    self_task: submissions.filter(s => s.type === 'self_task').length,
  };

  const projectCounts = {
    all: submissions.length,
  };
  projects.forEach((p) => {
    projectCounts[p._id] = submissions.filter((s) => {
      const project = getProjectForSubmission(s);
      return project && project._id === p._id;
    }).length;
  });

  const filterTabs = [
    { id: 'all',       label: 'All',         count: counts.all       },
    { id: 'update',    label: 'Submissions',  count: counts.update    },
    { id: 'self_task', label: 'Self Tasks',   count: counts.self_task },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
             style={{ borderColor: 'var(--admin-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,var(--admin-primary),var(--admin-secondary))' }}>
            <FiFileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Submissions
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filtered.length} entries
            </p>
          </div>
        </div>
        <button onClick={fetchData}
                className="p-2 rounded-xl border transition-all hover:bg-white/5"
                style={{ borderColor: 'var(--border)' }}>
          <FiRefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',       value: counts.all,       color: '#94a3b8' },
          { label: 'Submissions', value: counts.update,    color: '#3b82f6' },
          { label: 'Self Tasks',  value: counts.self_task, color: '#a78bfa' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-xl border"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2">
        {filterTabs.map(tab => (
          <button key={tab.id} onClick={() => setFilter(tab.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: filter === tab.id
                      ? 'linear-gradient(135deg,var(--admin-primary),var(--admin-secondary))'
                      : 'var(--bg-card)',
                    color:  filter === tab.id ? '#000' : 'var(--text-secondary)',
                    border: filter === tab.id ? 'none' : '1px solid var(--border)',
                  }}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Project filter tabs */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setProjectFilter('all')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: projectFilter === 'all' ? 'var(--admin-primary)' : 'var(--bg-card)',
              color: projectFilter === 'all' ? '#000' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            <FiFolder className="w-3 h-3" />All Projects ({projectCounts.all})
          </button>
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => setProjectFilter(project._id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                background: projectFilter === project._id ? `${project.color}20` : 'var(--bg-card)',
                color: projectFilter === project._id ? project.color : 'var(--text-secondary)',
                border: `1px solid ${projectFilter === project._id ? project.color + '40' : 'var(--border)'}`,
              }}
            >
              <FiFolder className="w-3 h-3" />{project.name} ({projectCounts[project._id] || 0})
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiFileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => {
            const meta = TYPE_META[sub.type] || TYPE_META.update;
            const Icon = meta.icon;
            const project = getProjectForSubmission(sub);
            return (
              <div key={sub._id}
                   className="p-5 rounded-xl border transition-all hover:border-[var(--admin-primary)]"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                {/* Header row */}
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                       style={{ background: meta.bg }}>
                    <Icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase border"
                            style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}>
                        {meta.label}
                      </span>
                      {project && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                              style={{ background: `${project.color}20`, color: project.color, border: `1px solid ${project.color}40` }}>
                          <FiFolder className="w-3 h-3" />{project.name}
                        </span>
                      )}
                      {sub.taskId && (
                        <span className="text-sm font-semibold text-white">{sub.taskId.title}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-wrap"
                         style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1.5">
                        <FiUser className="w-3.5 h-3.5" />
                        {sub.createdBy?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-3.5 h-3.5" />
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap mb-3 pl-14">
                  {sub.content}
                </p>

                {/* Attachments */}
                {sub.attachments?.length > 0 && (
                  <div className="pl-14 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold"
                         style={{ color: 'var(--text-secondary)' }}>
                      <FiPaperclip className="w-3.5 h-3.5" />
                      {sub.attachments.length} attachment{sub.attachments.length > 1 ? 's' : ''}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sub.attachments.map((file, idx) => (
                        <div key={idx}
                             className="flex items-center gap-3 p-3 rounded-lg border"
                             style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                               style={{ background: isImageMime(file.fileType) ? 'rgba(99,102,241,0.15)' : 'rgba(249,115,22,0.12)' }}>
                            {isImageMime(file.fileType)
                              ? <FiImage    className="w-5 h-5" style={{ color: '#818cf8' }} />
                              : <FiFileText className="w-5 h-5" style={{ color: 'var(--admin-primary)' }} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {file.originalName}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : ''}
                            </div>
                          </div>
                          <button
                            onClick={() => downloadFile(file.filename, file.originalName)}
                            className="p-2 rounded-lg transition-all hover:bg-white/10 shrink-0"
                            style={{ color: 'var(--admin-primary)' }}
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
