const User       = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadBufferToCloudinary } = require('../middleware/upload');

// ── One-time seed ─────────────────────────────────────────────────────────────
const seedSuperAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'super_admin' });
    if (exists) return res.status(400).json({ message: 'Super admin already exists' });

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, password required' });

    const sa = await User.create({ name, email, passwordHash: password, role: 'super_admin' });
    const safe = sa.toObject(); delete safe.passwordHash;
    res.status(201).json({ message: 'Super admin created', user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create supervisor ─────────────────────────────────────────────────────────
const createSupervisor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    let avatar;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, { folder: 'internpulse/avatars' });
      avatar = { url: result.secure_url, publicId: result.public_id };
    }

    const sup = await User.create({
      name, email,
      passwordHash: password,
      role:         'supervisor',
      createdBy:    req.user._id,
      ...(avatar && { avatar }),
    });
    const safe = sup.toObject(); delete safe.passwordHash;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── List all supervisors with internCount ─────────────────────────────────────
const getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const withCount = await Promise.all(
      supervisors.map(async (sup) => {
        const internCount = await User.countDocuments({ role: 'intern', createdBy: sup._id });
        return { ...sup.toObject(), internCount };
      })
    );

    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get one supervisor ────────────────────────────────────────────────────────
const getSupervisorById = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' })
      .select('-passwordHash');
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    const internCount = await User.countDocuments({ role: 'intern', createdBy: sup._id });
    res.json({ ...sup.toObject(), internCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Edit supervisor ───────────────────────────────────────────────────────────
const updateSupervisor = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    const { name, email, password } = req.body;
    if (name)  sup.name  = name;
    if (email) sup.email = email;
    if (password && password.trim()) sup.passwordHash = password;

    if (req.file) {
      if (sup.avatar?.publicId)
        await cloudinary.uploader.destroy(sup.avatar.publicId).catch(() => {});
      const result = await uploadBufferToCloudinary(req.file.buffer, { folder: 'internpulse/avatars' });
      sup.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    await sup.save();
    const safe = sup.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Toggle supervisor active/inactive ────────────────────────────────────────
const toggleSupervisorStatus = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    sup.isActive = !sup.isActive;
    await sup.save();
    const safe = sup.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete supervisor ─────────────────────────────────────────────────────────
const deleteSupervisor = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    if (sup.avatar?.publicId)
      await cloudinary.uploader.destroy(sup.avatar.publicId).catch(() => {});

    await sup.deleteOne();
    res.json({ message: 'Supervisor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get interns of a specific supervisor (read-only) ─────────────────────────
const getSupervisorInterns = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    const interns = await User.find({ role: 'intern', createdBy: sup._id })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json(interns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Analytics / Stats ────────────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    const User         = require('../models/User');
    const Task         = require('../models/Task');
    const Announcement = require('../models/Announcement');
    const Inquiry      = require('../models/Inquiry');
    const Notification = require('../models/Notification');
    const TaskUpdate   = require('../models/TaskUpdate');
    const RequiredDay  = require('../models/RequiredDay');

    const [
      totalSupervisors, activeSupervisors, inactiveSupervisors,
      totalInterns, activeInterns, inactiveInterns,
      totalTasks, pendingTasks, inProgressTasks, completedTasks,
      totalAnnouncements, totalInquiries, openInquiries, repliedInquiries, closedInquiries,
      totalNotifications, unreadNotifications,
      totalUpdates, totalRequiredDays,
    ] = await Promise.all([
      User.countDocuments({ role: 'supervisor' }),
      User.countDocuments({ role: 'supervisor', isActive: true }),
      User.countDocuments({ role: 'supervisor', isActive: false }),
      User.countDocuments({ role: 'intern' }),
      User.countDocuments({ role: 'intern', isActive: true }),
      User.countDocuments({ role: 'intern', isActive: false }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'completed' }),
      Announcement.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'open' }),
      Inquiry.countDocuments({ status: 'replied' }),
      Inquiry.countDocuments({ status: 'closed' }),
      Notification.countDocuments(),
      Notification.countDocuments({ isRead: false }),
      TaskUpdate.countDocuments(),
      RequiredDay.countDocuments(),
    ]);

    // Interns per supervisor (bar chart data)
    const supervisors = await User.find({ role: 'supervisor' }).select('name');
    const internsPerSupervisor = await Promise.all(
      supervisors.map(async (s) => {
        const count = await User.countDocuments({ role: 'intern', createdBy: s._id });
        return { name: s.name.split(' ')[0], fullName: s.name, interns: count };
      })
    );
    internsPerSupervisor.sort((a, b) => b.interns - a.interns);

    // User registrations over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('createdAt role');
    const registrationsByDay = {};
    recentUsers.forEach((u) => {
      const day = u.createdAt.toISOString().split('T')[0];
      if (!registrationsByDay[day]) registrationsByDay[day] = { supervisors: 0, interns: 0 };
      if (u.role === 'supervisor') registrationsByDay[day].supervisors++;
      else if (u.role === 'intern') registrationsByDay[day].interns++;
    });
    const registrationTimeline = Object.entries(registrationsByDay)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Task creation over time (last 30 days)
    const recentTasks = await Task.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt');
    const tasksByDay = {};
    recentTasks.forEach((t) => {
      const day = t.createdAt.toISOString().split('T')[0];
      tasksByDay[day] = (tasksByDay[day] || 0) + 1;
    });
    const taskTimeline = Object.entries(tasksByDay)
      .map(([date, count]) => ({ date, tasks: count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Inquiry status over time (last 30 days)
    const recentInquiries = await Inquiry.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt status');
    const inquiriesByDay = {};
    recentInquiries.forEach((inq) => {
      const day = inq.createdAt.toISOString().split('T')[0];
      if (!inquiriesByDay[day]) inquiriesByDay[day] = { open: 0, replied: 0, closed: 0 };
      inquiriesByDay[day][inq.status]++;
    });
    const inquiryTimeline = Object.entries(inquiriesByDay)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Task priority distribution
    const [lowPriority, mediumPriority, highPriority] = await Promise.all([
      Task.countDocuments({ priority: 'low' }),
      Task.countDocuments({ priority: 'medium' }),
      Task.countDocuments({ priority: 'high' }),
    ]);

    // Notification type distribution
    const notificationTypes = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      users: {
        totalSupervisors, activeSupervisors, inactiveSupervisors,
        totalInterns, activeInterns, inactiveInterns,
        total: totalSupervisors + totalInterns + 1,
      },
      tasks: { totalTasks, pendingTasks, inProgressTasks, completedTasks },
      announcements: { totalAnnouncements },
      inquiries: { totalInquiries, openInquiries, repliedInquiries, closedInquiries },
      notifications: { totalNotifications, unreadNotifications },
      updates: { totalUpdates },
      requiredDays: { totalRequiredDays },
      tasksByPriority: { low: lowPriority, medium: mediumPriority, high: highPriority },
      internsPerSupervisor,
      registrationTimeline,
      taskTimeline,
      inquiryTimeline,
      notificationTypes: notificationTypes.map(n => ({ type: n._id, count: n.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Report: Export all supervisors as CSV ────────────────────────────────────
const exportSupervisorsCSV = async (req, res) => {
  try {
    const User = require('../models/User');
    const supervisors = await User.find({ role: 'supervisor' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const withCount = await Promise.all(
      supervisors.map(async (s) => {
        const internCount = await User.countDocuments({ role: 'intern', createdBy: s._id });
        return { ...s.toObject(), internCount };
      })
    );

    const header = 'Name,Email,Active,Interns,Created At\n';
    const rows = withCount.map(s =>
      `"${s.name}","${s.email}",${s.isActive},${s.internCount},"${new Date(s.createdAt).toLocaleDateString()}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=supervisors_report.csv');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Report: Export all interns as CSV ────────────────────────────────────────
const exportInternsCSV = async (req, res) => {
  try {
    const User = require('../models/User');
    const interns = await User.find({ role: 'intern' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const supervisors = await User.find({ role: 'supervisor' }).select('name');
    const supMap = {};
    supervisors.forEach(s => { supMap[s._id.toString()] = s.name; });

    const header = 'Name,Email,Active,Supervisor,University,Hometown,Internship Start,Internship End,Created At\n';
    const rows = interns.map(i =>
      `"${i.name}","${i.email}",${i.isActive},"${supMap[i.createdBy?.toString()] || 'N/A'}","${i.university || ''}","${i.hometown || ''}","${i.internshipStart ? new Date(i.internshipStart).toLocaleDateString() : ''}","${i.internshipEnd ? new Date(i.internshipEnd).toLocaleDateString() : ''}","${new Date(i.createdAt).toLocaleDateString()}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=interns_report.csv');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Report: Export full hierarchy as CSV ─────────────────────────────────────
const exportHierarchyCSV = async (req, res) => {
  try {
    const User = require('../models/User');
    const supervisors = await User.find({ role: 'supervisor' }).select('name email isActive');

    let rows = [];
    for (const sup of supervisors) {
      const interns = await User.find({ role: 'intern', createdBy: sup._id })
        .select('name email isActive university hometown createdAt');
      rows.push({
        supervisorName: sup.name,
        supervisorEmail: sup.email,
        supervisorActive: sup.isActive,
        internCount: interns.length,
        interns: interns.map(i => ({
          name: i.name,
          email: i.email,
          isActive: i.isActive,
          university: i.university || '',
          hometown: i.hometown || '',
          joined: new Date(i.createdAt).toLocaleDateString(),
        })),
      });
    }

    const header = 'Supervisor,Supervisor Email,Supervisor Active,Intern Count,Intern Name,Intern Email,Intern Active,University,Hometown,Joined\n';
    const csvRows = [];
    for (const row of rows) {
      if (row.interns.length === 0) {
        csvRows.push(`"${row.supervisorName}","${row.supervisorEmail}",${row.supervisorActive},${row.internCount},"","","","","",""`);
      } else {
        for (const intern of row.interns) {
          csvRows.push(`"${row.supervisorName}","${row.supervisorEmail}",${row.supervisorActive},${row.internCount},"${intern.name}","${intern.email}",${intern.isActive},"${intern.university}","${intern.hometown}","${intern.joined}"`);
        }
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=full_hierarchy_report.csv');
    res.send(header + csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Report: Export tasks summary as CSV ──────────────────────────────────────
const exportTasksCSV = async (req, res) => {
  try {
    const Task = require('../models/Task');
    const User = require('../models/User');

    const tasks = await Task.find().sort({ createdAt: -1 });
    const users = await User.find().select('name');
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    const header = 'Title,Status,Priority,Created By,Assigned To,Due Date,Created At\n';
    const rows = tasks.map(t => {
      const assignedNames = (t.assignedTo || []).map(id => userMap[id.toString()] || 'Unknown').join('; ');
      return `"${t.title}","${t.status}","${t.priority}","${userMap[t.createdBy?.toString()] || 'Unknown'}","${assignedNames}","${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}","${new Date(t.createdAt).toLocaleDateString()}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks_report.csv');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Report: Export full system summary as CSV ────────────────────────────────
const exportFullReportCSV = async (req, res) => {
  try {
    const User         = require('../models/User');
    const Task         = require('../models/Task');
    const Announcement = require('../models/Announcement');
    const Inquiry      = require('../models/Inquiry');
    const TaskUpdate   = require('../models/TaskUpdate');
    const RequiredDay  = require('../models/RequiredDay');

    const supervisors = await User.find({ role: 'supervisor' }).select('name email isActive');
    const supMap = {};
    supervisors.forEach(s => { supMap[s._id.toString()] = s.name; });

    const interns = await User.find({ role: 'intern' }).select('-passwordHash');
    const tasks = await Task.find();
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    const updates = await TaskUpdate.countDocuments();
    const requiredDays = await RequiredDay.countDocuments();

    const taskMap = {};
    tasks.forEach(t => { taskMap[t._id.toString()] = t.title; });

    const lines = [];
    lines.push('INTERNPULSE SYSTEM REPORT');
    lines.push(`Generated,${new Date().toLocaleString()}`);
    lines.push('');

    lines.push('=== USER SUMMARY ===');
    lines.push(`Total Supervisors,${supervisors.length}`);
    lines.push(`Active Supervisors,${supervisors.filter(s => s.isActive).length}`);
    lines.push(`Total Interns,${interns.length}`);
    lines.push(`Active Interns,${interns.filter(i => i.isActive).length}`);
    lines.push('');

    lines.push('=== TASK SUMMARY ===');
    lines.push(`Total Tasks,${tasks.length}`);
    lines.push(`Pending,${tasks.filter(t => t.status === 'pending').length}`);
    lines.push(`In Progress,${tasks.filter(t => t.status === 'in-progress').length}`);
    lines.push(`Completed,${tasks.filter(t => t.status === 'completed').length}`);
    lines.push('');

    lines.push('=== INQUIRY SUMMARY ===');
    lines.push(`Total Inquiries,${inquiries.length}`);
    lines.push(`Open,${inquiries.filter(i => i.status === 'open').length}`);
    lines.push(`Replied,${inquiries.filter(i => i.status === 'replied').length}`);
    lines.push(`Closed,${inquiries.filter(i => i.status === 'closed').length}`);
    lines.push('');

    lines.push('=== ENGAGEMENT ===');
    lines.push(`Announcements,${announcements.length}`);
    lines.push(`Task Updates,${updates}`);
    lines.push(`Required Days Scheduled,${requiredDays}`);
    lines.push('');

    lines.push('=== SUPERVISOR DETAIL ===');
    lines.push('Supervisor,Email,Active,Intern Count');
    for (const sup of supervisors) {
      const count = interns.filter(i => i.createdBy?.toString() === sup._id.toString()).length;
      lines.push(`"${sup.name}","${sup.email}",${sup.isActive},${count}`);
    }
    lines.push('');

    lines.push('=== INTERN DETAIL ===');
    lines.push('Name,Email,Active,Supervisor,University,Joined');
    for (const intern of interns) {
      lines.push(`"${intern.name}","${intern.email}",${intern.isActive},"${supMap[intern.createdBy?.toString()] || 'N/A'}","${intern.university || ''}","${new Date(intern.createdAt).toLocaleDateString()}"`);
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=full_system_report.csv');
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  seedSuperAdmin,
  createSupervisor,
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  toggleSupervisorStatus,
  deleteSupervisor,
  getSupervisorInterns,
  getAnalytics,
  exportSupervisorsCSV,
  exportInternsCSV,
  exportHierarchyCSV,
  exportTasksCSV,
  exportFullReportCSV,
};