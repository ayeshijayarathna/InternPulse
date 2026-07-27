import { useState, useEffect, useRef } from 'react';
import {
  FiCheckSquare, FiPlus, FiEdit2, FiTrash2, FiUser, FiClock,
  FiAlertCircle, FiChevronDown, FiChevronRight, FiX, FiFolder, FiCheck
} from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

function MultiSelectInterns({ interns, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else onChange([...selected, id]);
  };

  const selectedInterns = interns.filter((i) => selected.includes(i._id));

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-left flex items-center justify-between gap-2"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: selected.length ? 'white' : 'var(--text-secondary)' }}>
        <span className="truncate text-sm">
          {selected.length === 0 ? 'Unassigned' : selected.length === 1 ? selectedInterns[0]?.name : `${selected.length} interns selected`}
        </span>
        <FiChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                       style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-secondary)' }} />
      </button>
      {selectedInterns.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedInterns.map((intern) => (
            <span key={intern._id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(var(--supervisor-primary-rgb, 249,115,22), 0.15)', color: 'var(--supervisor-primary)', border: '1px solid rgba(var(--supervisor-primary-rgb, 249,115,22), 0.3)' }}>
              {intern.name}
              <button type="button" onClick={() => toggle(intern._id)} className="ml-0.5 hover:opacity-70 transition-opacity">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border overflow-hidden shadow-2xl max-h-60 overflow-y-auto"
             style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <button type="button" onClick={() => { onChange([]); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-secondary)' }}>
            Unassigned
          </button>
          <div style={{ borderTop: '1px solid var(--border)' }} />
          {interns.map((intern) => {
            const checked = selected.includes(intern._id);
            return (
              <button key={intern._id} type="button" onClick={() => toggle(intern._id)}
                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors hover:bg-white/5"
                      style={{ background: checked ? 'rgba(var(--supervisor-primary-rgb, 249,115,22), 0.08)' : 'transparent' }}>
                <span className="w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all"
                      style={{ background: checked ? 'var(--supervisor-primary)' : 'transparent', borderColor: checked ? 'var(--supervisor-primary)' : 'var(--border)' }}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={{ color: checked ? 'white' : 'var(--text-secondary)' }}>{intern.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, projects, onEdit, onDelete, actionLoading }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':   return { bg: 'rgba(239,68,68,0.1)',   text: '#ef4444', border: 'rgba(239,68,68,0.3)' };
      case 'medium': return { bg: 'rgba(249,115,22,0.1)',  text: '#f97316', border: 'rgba(249,115,22,0.3)' };
      case 'low':    return { bg: 'rgba(34,197,94,0.1)',   text: '#22c55e', border: 'rgba(34,197,94,0.3)' };
      default:       return { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':  return { bg: 'rgba(34,197,94,0.1)',   text: '#22c55e', border: 'rgba(34,197,94,0.3)' };
      case 'in-progress':return { bg: 'rgba(249,115,22,0.1)',  text: '#f97316', border: 'rgba(249,115,22,0.3)' };
      default:           return { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
    }
  };

  const priorityStyle = getPriorityColor(task.priority);
  const statusStyle   = getStatusColor(task.status);
  const assigned = Array.isArray(task.assignedTo) ? task.assignedTo : task.assignedTo ? [task.assignedTo] : [];
  const project = task.projectId && typeof task.projectId === 'object' ? task.projectId : null;

  return (
    <div className="p-5 rounded-xl border transition-all hover:border-[var(--supervisor-primary)]"
         style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>
              {task.title}
            </h3>
            {project && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                    style={{ background: `${project.color}20`, color: project.color, border: `1px solid ${project.color}40` }}>
                <FiFolder className="w-3 h-3" />{project.name}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border"
                  style={{ background: priorityStyle.bg, color: priorityStyle.text, borderColor: priorityStyle.border }}>
              {task.priority}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
                  style={{ background: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
              {task.status.replace('-', ' ')}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
            {assigned.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <FiUser className="w-4 h-4 flex-shrink-0" />
                {assigned.map((intern) => {
                  const name = typeof intern === 'object' ? intern.name : intern;
                  return (
                    <span key={typeof intern === 'object' ? intern._id : intern}
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{ background: 'rgba(var(--supervisor-primary-rgb, 249,115,22), 0.1)', color: 'var(--supervisor-primary)', border: '1px solid rgba(var(--supervisor-primary-rgb, 249,115,22), 0.25)' }}>
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(task)} className="p-2 rounded-lg transition-all hover:bg-blue-500/10 text-blue-400">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(task._id)} disabled={actionLoading === task._id}
                  className="p-2 rounded-lg transition-all hover:bg-red-500/10 text-red-400">
            {actionLoading === task._id
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <FiTrash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium', status: 'pending',
    dueDate: '', assignedTo: [], projectId: '',
  });
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, internsRes, projectsRes] = await Promise.all([
        axiosInstance.get('/tasks'),
        axiosInstance.get('/users/interns'),
        axiosInstance.get('/projects'),
      ]);
      setTasks(tasksRes.data);
      setInterns(internsRes.data.filter((i) => i.isActive));
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ type: 'error', msg: 'Failed to load data' });
      setTimeout(() => setToast(null), 3000);
    } finally { setLoading(false); }
  };

  const availableInterns = formData.projectId
    ? (() => {
        const project = projects.find((p) => p._id === formData.projectId);
        if (!project) return interns;
        const projectInternIds = new Set(project.assignedInterns.map((i) => typeof i === 'object' ? i._id : i));
        return interns.filter((i) => projectInternIds.has(i._id));
      })()
    : interns;

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'medium', status: 'pending', dueDate: '', assignedTo: [], projectId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('submit');
      if (editingTask) {
        await axiosInstance.patch(`/tasks/${editingTask._id}`, formData);
        setToast({ type: 'success', msg: 'Task updated successfully!' });
        setTimeout(() => setToast(null), 3000);
      } else {
        await axiosInstance.post('/tasks', formData);
        setToast({ type: 'success', msg: 'Task created successfully!' });
        setTimeout(() => setToast(null), 3000);
      }
      setShowModal(false);
      setEditingTask(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      setToast({ type: 'error', msg: error.response?.data?.message || 'Failed to save task' });
      setTimeout(() => setToast(null), 3000);
    } finally { setActionLoading(null); }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title, description: task.description || '',
      priority: task.priority, status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: Array.isArray(task.assignedTo)
        ? task.assignedTo.map((a) => (typeof a === 'object' ? a._id : a))
        : task.assignedTo ? [typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo] : [],
      projectId: task.projectId ? (typeof task.projectId === 'object' ? task.projectId._id : task.projectId) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setActionLoading(taskId);
      await axiosInstance.delete(`/tasks/${taskId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      setToast({ type: 'error', msg: 'Failed to delete task' });
      setTimeout(() => setToast(null), 3000);
    } finally { setActionLoading(null); }
  };

  const filteredTasks = tasks.filter((t) => {
    if (projectFilter === 'all') return true;
    return t.projectId && (typeof t.projectId === 'object' ? t.projectId._id : t.projectId) === projectFilter;
  });

  const projectTaskCounts = { all: tasks.length };
  projects.forEach((p) => {
    projectTaskCounts[p._id] = tasks.filter((t) => {
      return t.projectId && (typeof t.projectId === 'object' ? t.projectId._id : t.projectId) === p._id;
    }).length;
  });

  const groupedByProject = {};
  projects.forEach((p) => { groupedByProject[p._id] = []; });
  const noProject = [];
  filteredTasks.forEach((t) => {
    const pid = t.projectId ? (typeof t.projectId === 'object' ? t.projectId._id : t.projectId) : null;
    if (pid && groupedByProject[pid]) groupedByProject[pid].push(t);
    else noProject.push(t);
  });

  const toggleCollapse = (pid) => {
    setCollapsedProjects(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-[var(--supervisor-primary)] border-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold shadow-lg backdrop-blur-sm transition-all"
             style={{
               background: toast.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
               borderColor: toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
               color: toast.type === 'success' ? '#22c55e' : '#ef4444',
             }}>
          {toast.type === 'success' ? <FiCheck className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--supervisor-primary)] to-[var(--supervisor-secondary)] flex items-center justify-center">
            <FiCheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Task Management
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{tasks.length} total tasks</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setEditingTask(null); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--supervisor-primary), var(--supervisor-secondary))' }}>
          <FiPlus className="w-4 h-4" />Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks',  value: tasks.length,                                          color: '#94a3b8' },
          { label: 'Projects',     value: projects.length,                                        color: '#f97316' },
          { label: 'Pending',      value: tasks.filter((t) => t.status === 'pending').length,     color: '#94a3b8' },
          { label: 'In Progress',  value: tasks.filter((t) => t.status === 'in-progress').length, color: '#f97316' },
          { label: 'Completed',    value: tasks.filter((t) => t.status === 'completed').length,   color: '#22c55e' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Project Filter Tabs */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button onClick={() => setProjectFilter('all')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: projectFilter === 'all' ? 'var(--supervisor-primary)' : 'var(--bg-card)',
                    color: projectFilter === 'all' ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}>
            All Tasks ({projectTaskCounts.all})
          </button>
          {projects.map((project) => (
            <button key={project._id} onClick={() => setProjectFilter(project._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: projectFilter === project._id ? `${project.color}20` : 'var(--bg-card)',
                      color: projectFilter === project._id ? project.color : 'var(--text-secondary)',
                      border: `1px solid ${projectFilter === project._id ? project.color + '40' : 'var(--border)'}`,
                    }}>
              <FiFolder className="w-3 h-3" />{project.name} ({projectTaskCounts[project._id] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-20">
          <FiCheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No tasks yet</h3>
          <p className="text-gray-500">Create your first task to get started</p>
        </div>
      ) : projectFilter !== 'all' ? (
        /* Single project flat view */
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} projects={projects} onEdit={handleEdit} onDelete={handleDelete} actionLoading={actionLoading} />
          ))}
        </div>
      ) : (
        /* All projects grouped view */
        <div className="space-y-4">
          {projects.map((project) => {
            const projectTasks = groupedByProject[project._id] || [];
            if (projectTasks.length === 0) return null;
            const isCollapsed = collapsedProjects[project._id];
            const completed = projectTasks.filter((t) => t.status === 'completed').length;
            const inProgress = projectTasks.filter((t) => t.status === 'in-progress').length;
            const pending = projectTasks.filter((t) => t.status === 'pending').length;
            return (
              <div key={project._id} className="rounded-xl border overflow-hidden"
                   style={{ background: 'var(--bg-card)', borderColor: project.color + '40' }}>
                <button onClick={() => toggleCollapse(project._id)}
                        className="w-full flex items-center justify-between px-5 py-3 transition-all hover:bg-white/5"
                        style={{ borderBottom: isCollapsed ? 'none' : `1px solid ${project.color}30` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: project.color }} />
                    <span className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      {project.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                          style={{ background: `${project.color}20`, color: project.color }}>
                      {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-xs">
                      {pending > 0 && <span className="px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400">{pending} pending</span>}
                      {inProgress > 0 && <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">{inProgress} in progress</span>}
                      {completed > 0 && <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">{completed} completed</span>}
                    </div>
                    {isCollapsed
                      ? <FiChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      : <FiChevronDown   className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    }
                  </div>
                </button>
                {!isCollapsed && (
                  <div className="p-4 space-y-3">
                    {projectTasks.map((task) => (
                      <TaskCard key={task._id} task={task} projects={projects} onEdit={handleEdit} onDelete={handleDelete} actionLoading={actionLoading} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {noProject.length > 0 && (
            <div className="rounded-xl border overflow-hidden"
                 style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-3 flex items-center gap-3"
                   style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="font-bold text-gray-400" style={{ fontFamily: 'var(--font-display)' }}>
                  No Project
                </span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-gray-500/10 text-gray-400">
                  {noProject.length} task{noProject.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {noProject.map((task) => (
                  <TaskCard key={task._id} task={task} projects={projects} onEdit={handleEdit} onDelete={handleDelete} actionLoading={actionLoading} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl p-6 my-8" style={{ background: 'var(--bg-card)' }}>
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Task Title *</label>
                <input type="text" required value={formData.title}
                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                       style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                       placeholder="Enter task title" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Description</label>
                <textarea rows={3} value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white resize-none"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                          placeholder="Enter task description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Project</label>
                  <select value={formData.projectId}
                          onChange={(e) => setFormData({ ...formData, projectId: e.target.value, assignedTo: [] })}
                          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <option value="">No Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Priority</label>
                  <select value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Status</label>
                <select value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Due Date</label>
                  <input type="date" value={formData.dueDate}
                         onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                         className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                         style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Assign To
                    {formData.assignedTo.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold"
                            style={{ background: 'var(--supervisor-primary)', color: 'black' }}>
                        {formData.assignedTo.length}
                      </span>
                    )}
                  </label>
                  {formData.projectId ? (
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      Showing {availableInterns.length} intern{availableInterns.length !== 1 ? 's' : ''} assigned to this project
                    </p>
                  ) : (
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                      Select a project first to limit assignees
                    </p>
                  )}
                  <MultiSelectInterns interns={availableInterns} selected={formData.assignedTo}
                                       onChange={(val) => setFormData({ ...formData, assignedTo: val })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                        onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading === 'submit'}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, var(--supervisor-primary), var(--supervisor-secondary))' }}>
                  {actionLoading === 'submit' ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
