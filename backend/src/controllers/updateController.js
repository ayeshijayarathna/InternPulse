const path       = require('path');
const TaskUpdate = require('../models/TaskUpdate');
const Task       = require('../models/Task');
const User       = require('../models/User');
const { createNotification } = require('../services/notificationService');

// POST /api/updates 
// Intern submits update / self_task (locked after submit)
const createUpdate = async (req, res) => {
  try {
    const { taskId, type, content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // If taskId provided, verify intern is assigned to that task
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, assignedTo: req.user._id });
      if (!task) {
        return res.status(403).json({ message: 'Task not found or not assigned to you' });
      }
    }

    // Build attachments array from disk-saved files 
    const attachments = (req.files || []).map(file => ({
      filename:     file.filename,                    // saved name on disk e.g. 1718000000-123456.pdf
      originalName: file.originalname,
      fileType:     file.mimetype,
      fileSize:     file.size,
      path:         file.path,                        // absolute path (server-side only)
    }));

    const update = await TaskUpdate.create({
      taskId:    taskId || null,
      createdBy: req.user._id,
      type:      type   || 'update',
      content:   content.trim(),
      locked:    true,
      attachments,
    });

    await update.populate('taskId',    'title');
    await update.populate('createdBy', 'name email');

    //Notify supervisor
    const internUser = await User.findById(req.user._id).select('createdBy name');
    if (internUser?.createdBy) {
      const io = req.app.locals.io;
      createNotification(io, {
        recipient: internUser.createdBy,
        type:      'submission_received',
        title:     '📨 New Submission Received',
        message:   `${internUser.name} submitted an update${update.taskId?.title ? ` for task: "${update.taskId.title}"` : ''}.`,
        taskId:    taskId || null,
        updateId:  update._id,
      });
    }

    res.status(201).json(update);
  } catch (err) {
    console.error('createUpdate error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// GET /api/updates/my
// Intern: own submissions only (read-only)
const getMyUpdates = async (req, res) => {
  try {
    const updates = await TaskUpdate.find({ createdBy: req.user._id })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/updates
// Supervisor: sees submissions from own interns ONLY
const getAllUpdates = async (req, res) => {
  try {
    const myInterns = await User.find({
      role:      'intern',
      createdBy: req.user._id,
    }).select('_id');

    const internIds = myInterns.map(i => i._id);

    const updates = await TaskUpdate.find({ createdBy: { $in: internIds } })
      .populate('taskId',    'title')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//  Edit / Delete blocked
const blockEdit   = (req, res) =>
  res.status(403).json({ message: 'Submissions are locked and cannot be edited' });

const blockDelete = (req, res) =>
  res.status(403).json({ message: 'Submissions are locked and cannot be deleted' });

module.exports = { createUpdate, getAllUpdates, getMyUpdates, blockEdit, blockDelete };