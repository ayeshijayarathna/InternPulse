const Task = require('../models/Task');
const User = require('../models/User');

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Supervisor creates task — assignedTo must be one of their own interns
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    // If assignedTo provided, verify the intern belongs to this supervisor
    if (assignedTo) {
      const intern = await User.findOne({
        _id:       assignedTo,
        role:      'intern',
        createdBy: req.user._id,
      });
      if (!intern) {
        return res.status(403).json({ message: 'You can only assign tasks to your own interns' });
      }
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate:    dueDate    || null,
      assignedTo: assignedTo || null,
      createdBy:  req.user._id,  // ← locked to this supervisor
    });

    await task.populate('assignedTo', 'name email');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Supervisor sees ONLY tasks they created
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })  // ← own tasks only
      .populate('assignedTo', 'name email')
      .populate('createdBy',  'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/tasks/my ─────────────────────────────────────────────────────────
// Intern sees tasks assigned to them ONLY
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
// Supervisor updates own task only
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,   // ← can only edit own tasks
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    // If re-assigning, verify new intern belongs to this supervisor
    if (req.body.assignedTo) {
      const intern = await User.findOne({
        _id:       req.body.assignedTo,
        role:      'intern',
        createdBy: req.user._id,
      });
      if (!intern) {
        return res.status(403).json({ message: 'You can only assign tasks to your own interns' });
      }
    }

    const allowed = ['title', 'description', 'priority', 'status', 'dueDate', 'assignedTo'];
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
// Supervisor deletes own task only
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id:       req.params.id,
      createdBy: req.user._id,   // ← can only delete own tasks
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