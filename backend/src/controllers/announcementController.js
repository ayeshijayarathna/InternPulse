const Announcement = require('../models/Announcement');
const User         = require('../models/User');
const { createNotification } = require('../services/notificationService');

//POST /api/announcements
// Super Admin: create announcement notify ALL supervisors
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content)
      return res.status(400).json({ message: 'Title and content are required' });

    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'medium',
      createdBy: req.user._id,
    });

    await announcement.populate('createdBy', 'name');

    // Notify all active supervisors
    const supervisors = await User.find({ role: 'supervisor', isActive: true }).select('_id');
    const io = req.app.locals.io;

    for (const sup of supervisors) {
      createNotification(io, {
        recipient:      sup._id,
        type:           'announcement',
        title:          `📢 New Announcement: ${title}`,
        message:        content.length > 100 ? content.substring(0, 100) + '…' : content,
        announcementId: announcement._id,
      });
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error('createAnnouncement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/announcements 
// Super Admin: all | Supervisor: all (read-only)
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/announcements/:id
// Super Admin only
const updateAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });

    const { title, content, priority } = req.body;
    if (title)    ann.title    = title;
    if (content)  ann.content  = content;
    if (priority) ann.priority = priority;

    await ann.save();
    await ann.populate('createdBy', 'name');
    res.json(ann);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//DELETE /api/announcements/:id 
// Super Admin only
const deleteAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    await ann.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement };