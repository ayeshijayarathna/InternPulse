import { useState, useEffect } from 'react';
import { FiFolder, FiPlus, FiEdit2, FiTrash2, FiUsers, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle, FiX, FiChevronDown, FiGithub } from 'react-icons/fi';
import { SiGithub } from 'react-icons/si';
import axiosInstance from '../../../api/axiosInstance';

const STATUS_META = {
  planning:  { color: '#8b5cf6', bg: '#8b5cf620', icon: FiClock,     label: 'Planning' },
  active:    { color: '#10b981', bg: '#10b98120', icon: FiCheckCircle, label: 'Active' },
  'on-hold': { color: '#f59e0b', bg: '#f59e0b20', icon: FiAlertCircle, label: 'On Hold' },
  completed: { color: '#3b82f6', bg: '#3b82f620', icon: FiCheckCircle, label: 'Completed' },
};

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignedInterns: [],
    status: 'planning',
    startDate: '',
    endDate: '',
    color: '#7c3aed',
    githubLink: '',
    supervisorGithubUsername: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, internRes] = await Promise.all([
        axiosInstance.get('/projects'),
        axiosInstance.get('/users/interns'),
      ]);
      setProjects(projRes.data);
      setInterns(internRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', assignedInterns: [], status: 'planning', startDate: '', endDate: '', color: '#7c3aed', githubLink: '', supervisorGithubUsername: '' });
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      assignedInterns: project.assignedInterns.map((i) => i._id),
      status: project.status,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      color: project.color || '#7c3aed',
      githubLink: project.githubLink || '',
      supervisorGithubUsername: project.supervisorGithubUsername || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };
      if (editingProject) {
        await axiosInstance.put(`/projects/${editingProject._id}`, payload);
      } else {
        await axiosInstance.post('/projects', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? Tasks will be unlinked but not deleted.')) return;
    try {
      await axiosInstance.delete(`/projects/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleIntern = (id) => {
    setFormData((prev) => ({
      ...prev,
      assignedInterns: prev.assignedInterns.includes(id)
        ? prev.assignedInterns.filter((i) => i !== id)
        : [...prev.assignedInterns, id],
    }));
  };

  const totalTasks = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
            <FiFolder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Projects</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage and track your projects</p>
          </div>
        </div>
        <button onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
          <FiPlus className="w-4 h-4" />New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: totalTasks, icon: FiFolder, color: '#7c3aed' },
          { label: 'Active', value: activeProjects, icon: FiCheckCircle, color: '#10b981' },
          { label: 'Total Interns', value: interns.length, icon: FiUsers, color: '#3b82f6' },
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

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <FiFolder className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-lg font-semibold" style={{ color: 'var(--text-secondary)' }}>No projects yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const meta = STATUS_META[project.status] || STATUS_META.planning;
            const StatusIcon = meta.icon;
            return (
              <div key={project._id}
                   className="rounded-xl border overflow-hidden transition-all hover:shadow-lg"
                   style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="h-2" style={{ background: project.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{project.name}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(project)}
                              className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
                              style={{ color: 'var(--text-secondary)' }}>
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(project._id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all text-red-400">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: meta.bg, color: meta.color }}>
                      <StatusIcon className="w-3 h-3" />{meta.label}
                    </span>
                  </div>

                  {(project.githubLink || project.supervisorGithubUsername) && (
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-1 hover:underline"
                           style={{ color: '#60a5fa' }}>
                          <FiGithub className="w-3.5 h-3.5" />Repository
                        </a>
                      )}
                      {project.supervisorGithubUsername && (
                        <a href={`https://github.com/${project.supervisorGithubUsername}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-1 hover:underline"
                           style={{ color: '#60a5fa' }}>
                          <FiGithub className="w-3.5 h-3.5" />@{project.supervisorGithubUsername}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {project.assignedInterns.length} intern{project.assignedInterns.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {project.assignedInterns.length > 0 && (
                    <div className="flex -space-x-2 mt-3">
                      {project.assignedInterns.slice(0, 5).map((intern, idx) => (
                        <div key={intern._id}
                             className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                             style={{ borderColor: 'var(--bg-card)', background: COLORS[idx % COLORS.length] }}>
                          {intern.name?.charAt(0)}
                        </div>
                      ))}
                      {project.assignedInterns.length > 5 && (
                        <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                             style={{ borderColor: 'var(--bg-card)', background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                          +{project.assignedInterns.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border p-6 max-h-[85vh] overflow-y-auto"
               style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-secondary)' }}>
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Project Name *</label>
                <input type="text" required value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                       style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
                <textarea rows={3} value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 resize-none"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Status</label>
                  <select value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Color</label>
                  <div className="flex items-center gap-2">
                    {COLORS.map((c) => (
                      <button key={c} type="button"
                              onClick={() => setFormData({ ...formData, color: c })}
                              className="w-7 h-7 rounded-full border-2 transition-all"
                              style={{ background: c, borderColor: formData.color === c ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Start Date</label>
                  <input type="date" value={formData.startDate}
                         onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                         className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>End Date</label>
                  <input type="date" value={formData.endDate}
                         onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                         className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>GitHub Repository Link</label>
                  <input type="url" value={formData.githubLink}
                         onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                         placeholder="https://github.com/user/repo"
                         className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Supervisor GitHub Username</label>
                  <input type="text" value={formData.supervisorGithubUsername}
                         onChange={(e) => setFormData({ ...formData, supervisorGithubUsername: e.target.value })}
                         placeholder="e.g. johndoe"
                         className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
                         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Assign Interns</label>
                <div className="border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1"
                     style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                  {interns.map((intern) => (
                    <label key={intern._id}
                           className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-white/5">
                      <input type="checkbox"
                             checked={formData.assignedInterns.includes(intern._id)}
                             onChange={() => toggleIntern(intern._id)}
                             className="rounded" />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{intern.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{intern.email}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold border transition-all hover:bg-white/5"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                  {actionLoading ? 'Saving...' : editingProject ? 'Update' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
