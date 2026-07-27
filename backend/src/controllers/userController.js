const path      = require('path');
const fs        = require('fs');
const User      = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadBufferToCloudinary, isImage } = require('../middleware/upload');
const { sendWelcomeMail }    = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

const CV_DIR = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(CV_DIR)) fs.mkdirSync(CV_DIR, { recursive: true });

//GET /api/users/interns 
const getInterns = async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern', createdBy: req.user._id })
      .select('-passwordHash').sort({ createdAt: -1 });
    res.json(interns);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//POST /api/users/intern 
const createIntern = async (req, res) => {
  try {
    const { name, email, password, internshipStart, internshipEnd } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    let avatar;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'internpulse/avatars', resource_type: 'image',
      });
      avatar = { url: result.secure_url, publicId: result.public_id };
    }

    const intern = await User.create({
      name, email, passwordHash: password, role: 'intern', createdBy: req.user._id,
      internshipStart: internshipStart || null,
      internshipEnd:   internshipEnd   || null,
      ...(avatar && { avatar }),
    });

    const safe = intern.toObject(); delete safe.passwordHash;

    sendWelcomeMail({ name, email, password }).catch(err =>
      console.error('Welcome email error:', err)
    );
    createNotification(req.app.locals.io, {
      recipient: intern._id, type: 'welcome',
      title: '👋 Welcome to InternPulse!',
      message: `Hi ${name}, your account has been created. Check your email for login credentials.`,
    });

    res.status(201).json(safe);
  } catch (err) {
    console.error('createIntern error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// PATCH /api/users/intern/:id
const updateIntern = async (req, res) => {
  try {
    const intern = await User.findOne({ _id: req.params.id, createdBy: req.user._id, role: 'intern' });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    const { name, email, password, internshipStart, internshipEnd } = req.body;
    if (name)  intern.name  = name;
    if (email) intern.email = email;
    if (password && password.trim()) intern.passwordHash = password;
    if (internshipStart !== undefined) intern.internshipStart = internshipStart || null;
    if (internshipEnd   !== undefined) intern.internshipEnd   = internshipEnd   || null;

    if (req.file) {
      if (intern.avatar?.publicId)
        await cloudinary.uploader.destroy(intern.avatar.publicId).catch(() => {});
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'internpulse/avatars', resource_type: 'image',
      });
      intern.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    await intern.save();
    const safe = intern.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

//PATCH /api/users/intern/:id/toggle 
const toggleInternStatus = async (req, res) => {
  try {
    const intern = await User.findOne({ _id: req.params.id, createdBy: req.user._id, role: 'intern' });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });
    intern.isActive = !intern.isActive;
    await intern.save();
    const safe = intern.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//DELETE /api/users/intern/:id 
const deleteIntern = async (req, res) => {
  try {
    const intern = await User.findOne({ _id: req.params.id, createdBy: req.user._id, role: 'intern' });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    if (intern.avatar?.publicId)
      await cloudinary.uploader.destroy(intern.avatar.publicId).catch(() => {});

    if (intern.cv?.filename) {
      const cvPath = path.join(CV_DIR, intern.cv.filename);
      if (fs.existsSync(cvPath)) fs.unlinkSync(cvPath);
    }

    await intern.deleteOne();
    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//PATCH /api/users/avatar 
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (user.avatar?.publicId)
      await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'internpulse/avatars', resource_type: 'image',
    });
    user.avatar = { url: result.secure_url, publicId: result.public_id };
    await user.save();
    const safe = user.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/avatar 
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.avatar?.url && !user.avatar?.publicId)
      return res.status(400).json({ message: 'No avatar to delete' });

    // Delete from Cloudinary if has publicId
    if (user.avatar?.publicId)
      await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});

    user.avatar = { url: null, publicId: null };
    await user.save();
    const safe = user.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    console.error('deleteAvatar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { university, hometown } = req.body;
    if (university !== undefined) user.university = university || null;
    if (hometown   !== undefined) user.hometown   = hometown   || null;

    if (req.file && isImage(req.file.mimetype)) {
      if (user.avatar?.publicId)
        await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'internpulse/avatars', resource_type: 'image',
      });
      user.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    await user.save();
    const safe = user.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/cv 
const uploadCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.cv?.filename) {
      const old = path.join(CV_DIR, user.cv.filename);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    user.cv = {
      filename:     req.file.filename,
      originalName: req.file.originalname,
      fileSize:     req.file.size,
      uploadedAt:   new Date(),
    };

    await user.save();
    const safe = user.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/intern/:id/cv 
const downloadInternCV = async (req, res) => {
  try {
    const intern = await User.findOne({ _id: req.params.id, createdBy: req.user._id, role: 'intern' });
    if (!intern)              return res.status(404).json({ message: 'Intern not found' });
    if (!intern.cv?.filename) return res.status(404).json({ message: 'No CV uploaded' });

    const cvPath = path.join(CV_DIR, intern.cv.filename);
    if (!fs.existsSync(cvPath)) return res.status(404).json({ message: 'CV file not found on server' });

    res.download(cvPath, intern.cv.originalName || intern.cv.filename);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/my-analytics
// Intern: own performance analytics for dashboard charts
const getMyAnalytics = async (req, res) => {
  try {
    const Task         = require('../models/Task');
    const TaskUpdate   = require('../models/TaskUpdate');
    const Inquiry      = require('../models/Inquiry');
    const RequiredDay  = require('../models/RequiredDay');
    const Notification = require('../models/Notification');

    const userId = req.user._id;

    const [
      totalTasks, pendingTasks, inProgressTasks, completedTasks,
      lowPriority, mediumPriority, highPriority,
      totalUpdates, updateCount, blockerCount, selfTaskCount,
      totalInquiries, openInquiries, repliedInquiries, closedInquiries,
      totalRequiredDays, confirmedDays, unavailableDays,
      totalNotifications, unreadNotifications,
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'pending' }),
      Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' }),
      Task.countDocuments({ assignedTo: userId, priority: 'low' }),
      Task.countDocuments({ assignedTo: userId, priority: 'medium' }),
      Task.countDocuments({ assignedTo: userId, priority: 'high' }),
      TaskUpdate.countDocuments({ createdBy: userId }),
      TaskUpdate.countDocuments({ createdBy: userId, type: 'update' }),
      TaskUpdate.countDocuments({ createdBy: userId, type: 'blocker' }),
      TaskUpdate.countDocuments({ createdBy: userId, type: 'self_task' }),
      Inquiry.countDocuments({ createdBy: userId }),
      Inquiry.countDocuments({ createdBy: userId, status: 'open' }),
      Inquiry.countDocuments({ createdBy: userId, status: 'replied' }),
      Inquiry.countDocuments({ createdBy: userId, status: 'closed' }),
      RequiredDay.countDocuments({ intern: userId }),
      RequiredDay.countDocuments({ intern: userId, status: 'confirmed' }),
      RequiredDay.countDocuments({ intern: userId, status: 'unavailable' }),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    // Submission timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUpdates = await TaskUpdate.find({ createdBy: userId, createdAt: { $gte: thirtyDaysAgo } })
      .select('createdAt type');
    const submissionsByDay = {};
    recentUpdates.forEach((u) => {
      const day = u.createdAt.toISOString().split('T')[0];
      if (!submissionsByDay[day]) submissionsByDay[day] = { updates: 0, blockers: 0, selfTasks: 0 };
      if (u.type === 'update') submissionsByDay[day].updates++;
      else if (u.type === 'blocker') submissionsByDay[day].blockers++;
      else if (u.type === 'self_task') submissionsByDay[day].selfTasks++;
    });
    const submissionTimeline = Object.entries(submissionsByDay)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Task progress over time (created vs completed by week)
    const myTasks = await Task.find({ assignedTo: userId }).select('createdAt status');
    const tasksByWeek = {};
    myTasks.forEach((t) => {
      const d = new Date(t.createdAt);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      if (!tasksByWeek[key]) tasksByWeek[key] = { assigned: 0, completed: 0 };
      tasksByWeek[key].assigned++;
      if (t.status === 'completed') tasksByWeek[key].completed++;
    });
    const taskProgressTimeline = Object.entries(tasksByWeek)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Notification type distribution
    const notificationTypes = await Notification.aggregate([
      { $match: { recipient: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Performance score (simple calculation)
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const submissionScore = Math.min(totalUpdates * 10, 100);
    const attendanceScore = totalRequiredDays > 0 ? Math.round((confirmedDays / totalRequiredDays) * 100) : 100;
    const overallScore = Math.round((taskCompletionRate * 0.4 + submissionScore * 0.3 + attendanceScore * 0.3));

    res.json({
      tasks: { totalTasks, pendingTasks, inProgressTasks, completedTasks },
      tasksByPriority: { low: lowPriority, medium: mediumPriority, high: highPriority },
      updates: { totalUpdates, updateCount, blockerCount, selfTaskCount },
      inquiries: { totalInquiries, openInquiries, repliedInquiries, closedInquiries },
      requiredDays: { totalRequiredDays, confirmedDays, unavailableDays },
      notifications: { totalNotifications, unreadNotifications },
      submissionTimeline,
      taskProgressTimeline,
      notificationTypes: notificationTypes.map(n => ({ type: n._id, count: n.count })),
      performance: { taskCompletionRate, submissionScore, attendanceScore, overallScore },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInterns, createIntern, updateIntern, toggleInternStatus, deleteIntern,
  updateAvatar, deleteAvatar,
  updateProfile, uploadCV, downloadInternCV, getMe, getMyAnalytics,
};