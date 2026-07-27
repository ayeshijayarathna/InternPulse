const Inquiry  = require('../models/Inquiry');
const User     = require('../models/User');
const { createNotification } = require('../services/notificationService');

// POST /api/inquiries 
// Intern: send inquiry to their supervisor
const createInquiry = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message)
      return res.status(400).json({ message: 'Subject and message are required' });

    // Find this intern's supervisor
    const intern = await User.findById(req.user._id).select('createdBy name');
    if (!intern?.createdBy)
      return res.status(400).json({ message: 'No supervisor assigned' });

    const inquiry = await Inquiry.create({
      subject,
      message,
      createdBy:  req.user._id,
      supervisor: intern.createdBy,
      status:     'open',
    });

    await inquiry.populate('createdBy',  'name email avatar');
    await inquiry.populate('supervisor', 'name email');

    // Notify supervisor
    const io = req.app.locals.io;
    createNotification(io, {
      recipient:  intern.createdBy,
      type:       'inquiry_received',
      title:      `📩 New Inquiry from ${intern.name}`,
      message:    `Subject: "${subject}"`,
      inquiryId:  inquiry._id,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    console.error('createInquiry error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/inquiries/my 
// Intern: own inquiries
const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ createdBy: req.user._id })
      .populate('supervisor', 'name avatar')
      .populate('replies.sender', 'name avatar role')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET /api/inquiries 
// Supervisor: inquiries from own interns only
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ supervisor: req.user._id })
      .populate('createdBy',    'name email avatar')
      .populate('replies.sender', 'name avatar role')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/inquiries/:id/reply 
// Supervisor: reply to inquiry
const replyInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const inquiry = await Inquiry.findOne({
      _id:        req.params.id,
      supervisor: req.user._id,
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.replies.push({ sender: req.user._id, message });
    inquiry.status = 'replied';
    await inquiry.save();

    await inquiry.populate('createdBy',     'name email avatar');
    await inquiry.populate('replies.sender', 'name avatar role');

    // Notify intern
    const io = req.app.locals.io;
    createNotification(io, {
      recipient:  inquiry.createdBy._id,
      type:       'inquiry_reply',
      title:      '💬 Your inquiry received a reply',
      message:    `Your supervisor replied to: "${inquiry.subject}"`,
      inquiryId:  inquiry._id,
    });

    res.json(inquiry);
  } catch (err) {
    console.error('replyInquiry error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/inquiries/:id 
// Intern: edit subject/message (only if no replies yet)
const updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    if (inquiry.replies.length > 0)
      return res.status(403).json({ message: 'Cannot edit after supervisor has replied' });

    const { subject, message } = req.body;
    if (subject) inquiry.subject = subject;
    if (message) inquiry.message = message;
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//  DELETE /api/inquiries/:id 
// Intern: delete own inquiry (only if no replies)
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    if (inquiry.replies.length > 0)
      return res.status(403).json({ message: 'Cannot delete after supervisor has replied' });

    await inquiry.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/inquiries/:id/status
// Supervisor: close inquiry
const closeInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id:        req.params.id,
      supervisor: req.user._id,
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.status = 'closed';
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin Inquiry Functions ───────────────────────────────────────────

// POST /api/inquiries/admin
// Super admin: send inquiry to a supervisor
const createAdminInquiry = async (req, res) => {
  try {
    const { subject, message, supervisorId } = req.body;
    if (!subject || !message || !supervisorId)
      return res.status(400).json({ message: 'Subject, message, and supervisorId are required' });

    const supervisor = await User.findById(supervisorId).select('name');
    if (!supervisor) return res.status(404).json({ message: 'Supervisor not found' });

    const inquiry = await Inquiry.create({
      subject,
      message,
      createdBy:  req.user._id,
      supervisor: supervisorId,
      type:       'admin',
      status:     'open',
    });

    await inquiry.populate('createdBy',  'name email avatar');
    await inquiry.populate('supervisor', 'name email');

    const io = req.app.locals.io;
    createNotification(io, {
      recipient:  supervisorId,
      type:       'admin_inquiry_received',
      title:      `📩 New Inquiry from Super Admin`,
      message:    `Subject: "${subject}"`,
      inquiryId:  inquiry._id,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    console.error('createAdminInquiry error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/inquiries/admin
// Super admin: all admin inquiries
const getAdminInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ type: 'admin' })
      .populate('createdBy',    'name email avatar role')
      .populate('supervisor',   'name email avatar')
      .populate('replies.sender', 'name avatar role')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/inquiries/admin/mine
// Supervisor: admin inquiries sent to me or created by me
const getMyAdminInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({
      type: 'admin',
      $or: [{ supervisor: req.user._id }, { createdBy: req.user._id }],
    })
      .populate('createdBy',    'name email avatar role')
      .populate('supervisor',   'name email avatar')
      .populate('replies.sender', 'name avatar role')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/inquiries/admin/:id/reply
// Reply to admin inquiry (both super admin and supervisor can reply)
const replyAdminInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const inquiry = await Inquiry.findOne({
      _id:  req.params.id,
      type: 'admin',
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.replies.push({ sender: req.user._id, message });
    inquiry.status = 'replied';
    await inquiry.save();

    await inquiry.populate('createdBy',     'name email avatar');
    await inquiry.populate('supervisor',    'name email avatar');
    await inquiry.populate('replies.sender', 'name avatar role');

    // Notify the other party
    const io = req.app.locals.io;
    const recipientId = req.user._id.toString() === inquiry.createdBy._id.toString()
      ? inquiry.supervisor._id
      : inquiry.createdBy._id;

    const recipientName = req.user._id.toString() === inquiry.createdBy._id.toString()
      ? inquiry.supervisor.name
      : inquiry.createdBy.name;

    createNotification(io, {
      recipient:  recipientId,
      type:       'admin_inquiry_reply',
      title:      `💬 Inquiry reply from ${req.user.name}`,
      message:    `Reply to: "${inquiry.subject}"`,
      inquiryId:  inquiry._id,
    });

    res.json(inquiry);
  } catch (err) {
    console.error('replyAdminInquiry error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/inquiries/admin/:id/status
// Close admin inquiry
const closeAdminInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id:  req.params.id,
      type: 'admin',
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.status = 'closed';
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createInquiry, getMyInquiries, getInquiries,
  replyInquiry, updateInquiry, deleteInquiry, closeInquiry,
  createAdminInquiry, getAdminInquiries, getMyAdminInquiries,
  replyAdminInquiry, closeAdminInquiry,
};