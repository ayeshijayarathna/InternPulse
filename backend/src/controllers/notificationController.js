const Notification = require('../models/Notification');

// GET /api/notifications 
// Returns latest 50 notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('taskId',   'title')
      .populate('updateId', 'content');

    res.json(notifications);
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/notifications/unread-count 
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead:    false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//PATCH /api/notifications/:id/read 
const markRead = async (req, res) => {
  try {
    await Notification.updateOne(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/notifications/mark-all-read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead };
