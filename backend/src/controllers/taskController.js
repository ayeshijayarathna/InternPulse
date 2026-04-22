const Task = require('../models/Task');
const User = require('../models/User');

// Helper: validate that all provided intern IDs belong to this supervisor
const validateInterns = async (internIds, supervisorId) => {
  if (!internIds || internIds.length === 0) return true;
  const count = await User.countDocuments({
    _id:       { $in: internIds },
    role:      'intern',
    createdBy: supervisorId,
  });
  return count === internIds.length;
};

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Supervisor creates task — assignedTo is now an array of intern IDs
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // Normalize: accept single ID string or array
    const assignedIds = assignedTo
      ? Array.isArray(assignedTo)
        ? assignedTo.filter(Boolean)
        : [assignedTo].filter(Boolean)
      : [];

    // Verify every intern belongs to this supervisor
    if (assignedIds.length > 0) {
      const valid = await validateInterns(assignedIds, req.user._id);
      if (!valid) {
        return res.status(403).json({ message: 'You can only assign tasks to your own interns' });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate:    dueDate       || null,
      assignedTo: assignedIds,          // ← array
      createdBy:  req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/tasks ────────────────────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/tasks/my ─────────────────────────────────────────────────────────
// Intern sees tasks where their ID is in the assignedTo array
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    // Handle assignedTo update — normalize to array
    if (req.body.assignedTo !== undefined) {
      const assignedIds = Array.isArray(req.body.assignedTo)
        ? req.body.assignedTo.filter(Boolean)
        : req.body.assignedTo
          ? [req.body.assignedTo]
          : [];

      if (assignedIds.length > 0) {
        const valid = await validateInterns(assignedIds, req.user._id);
        if (!valid) {
          return res.status(403).json({ message: 'You can only assign tasks to your own interns' });
        }
      }
      task.assignedTo = assignedIds;
      delete req.body.assignedTo; // handled above
    }

    const allowed = ['title', 'description', 'priority', 'status', 'dueDate'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id:       req.params.id,
      createdBy: req.user._id,
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createTask, getAllTasks, getMyTasks, updateTask, deleteTask };