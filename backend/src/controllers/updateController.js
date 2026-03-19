const TaskUpdate = require('../models/TaskUpdate');
const Task       = require('../models/Task');
const User       = require('../models/User');
const { uploadBufferToCloudinary, isImage } = require('../middleware/upload');

// ── POST /api/updates ─────────────────────────────────────────────────────────
// Intern submits update / self_task (locked after submit)
const createUpdate = async (req, res) => {
  try {
    const { taskId, type, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // If taskId provided, verify intern is assigned to that task
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, assignedTo: req.user._id });
      if (!task) {
        return res.status(403).json({ message: 'Task not found or not assigned to you' });
      }
    }

    // Handle file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const resourceType = isImage(file.mimetype) ? 'image' : 'raw';
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder:        'internpulse/attachments',
          resource_type: resourceType,
          public_id:     `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
        });
        attachments.push({
          url:          result.secure_url,
          publicId:     result.public_id,
          originalName: file.originalname,
          fileType:     file.mimetype,
          fileSize:     file.size,
          resourceType,
        });
      }
    }

    const update = await TaskUpdate.create({
      taskId:    taskId || null,
      createdBy: req.user._id,
      type:      type   || 'update',
      content,
      locked:    true,
      attachments,
    });

    await update.populate('taskId',    'title');
    await update.populate('createdBy', 'name email');
    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/updates ──────────────────────────────────────────────────────────
// Supervisor: sees submissions from their own interns ONLY
const getAllUpdates = async (req, res) => {
  try {
    // Get IDs of interns belonging to this supervisor
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
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/updates/my ───────────────────────────────────────────────────────
// Intern: own submissions only (read-only)
const getMyUpdates = async (req, res) => {
  try {
    const updates = await TaskUpdate.find({ createdBy: req.user._id })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── Edit / Delete blocked ─────────────────────────────────────────────────────
const blockEdit = (req, res) => {
  res.status(403).json({ message: 'Submissions are locked and cannot be edited' });
};

const blockDelete = (req, res) => {
  res.status(403).json({ message: 'Submissions are locked and cannot be deleted' });
};

module.exports = { createUpdate, getAllUpdates, getMyUpdates, blockEdit, blockDelete };