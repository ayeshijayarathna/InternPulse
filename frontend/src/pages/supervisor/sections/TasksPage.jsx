import { useState, useEffect } from 'react';
import { FiCheckSquare, FiPlus, FiEdit2, FiTrash2, FiUser, FiClock, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: ''
  });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, internsRes] = await Promise.all([
        axiosInstance.get('/tasks'),
        axiosInstance.get('/users/interns')
      ]);
      setTasks(tasksRes.data);
      setInterns(internsRes.data.filter(i => i.isActive));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('submit');
      
      if (editingTask) {
        await axiosInstance.patch(`/tasks/${editingTask._id}`, formData);
        alert('Task updated successfully!');
      } else {
        await axiosInstance.post('/tasks', formData);
        alert('Task created successfully!');
      }
      
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        assignedTo: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.response?.data?.message || 'Failed to save task');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || ''
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
      alert('Failed to delete task');
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'medium': return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' };
      case 'low': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' };
      case 'in-progress': return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' };
      case 'pending': return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--admin-primary)] to-[var(--admin-secondary)] flex items-center justify-center">
            <FiCheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Task Management
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {tasks.length} total tasks
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-black transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}
        >
          <FiPlus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length, icon: FiCheckSquare, color: '#94a3b8' },
          { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, icon: FiAlertCircle, color: '#94a3b8' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: FiClock, color: '#f97316' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: FiCheckSquare, color: '#22c55e' }
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-20">
          <FiCheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No tasks yet</h3>
          <p className="text-gray-500">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const priorityStyle = getPriorityColor(task.priority);
            const statusStyle = getStatusColor(task.status);
            
            return (
              <div
                key={task._id}
                className="p-5 rounded-xl border transition-all hover:border-[var(--admin-primary)]"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'var(--font-display)' }}>
                        {task.title}
                      </h3>
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border"
                        style={{
                          background: priorityStyle.bg,
                          color: priorityStyle.text,
                          borderColor: priorityStyle.border
                        }}
                      >
                        {task.priority}
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          borderColor: statusStyle.border
                        }}
                      >
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                      {task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span>{task.assignedTo.name}</span>
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
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 rounded-lg transition-all hover:bg-blue-500/10 text-blue-400"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      disabled={actionLoading === task._id}
                      className="p-2 rounded-lg transition-all hover:bg-red-500/10 text-red-400"
                    >
                      {actionLoading === task._id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl p-6 my-8" style={{ background: 'var(--bg-card)' }}>
            <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white resize-none"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
                    Assign To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all text-white"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  >
                    <option value="">Unassigned</option>
                    {interns.map((intern) => (
                      <option key={intern._id} value={intern._id}>
                        {intern.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      priority: 'medium',
                      status: 'pending',
                      dueDate: '',
                      assignedTo: ''
                    });
                  }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'submit'}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-black transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-secondary))' }}
                >
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