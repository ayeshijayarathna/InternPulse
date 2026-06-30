const RequiredDay = require('../models/RequiredDay');
const User        = require('../models/User');
const { createNotification } = require('../services/notificationService');

// Normalize any date input to UTC midnight, so "2026-07-01" and
// "2026-07-01T14:30:00" both map to the same calendar day.
const toMidnightUTC = (input) => {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// POST /api/required-days 
// Supervisor: assign one or more interns to a required date
const createRequiredDays = async (req, res) => {
  try {
    const { date, internIds } = req.body;

    if (!date || !Array.isArray(internIds) || internIds.length === 0) {
      return res.status(400).json({ message: 'Date and at least one intern are required' });
    }

    const normalizedDate = toMidnightUTC(date);

    // Confirm all interns belong to this supervisor
    const interns = await User.find({
      _id:       { $in: internIds },
      role:      'intern',
      createdBy: req.user._id,
    });

    if (interns.length === 0) {
      return res.status(404).json({ message: 'No matching interns found' });
    }

    const created = [];
    const skipped = [];

    for (const intern of interns) {
      try {
        const doc = await RequiredDay.create({
          date:       normalizedDate,
          intern:     intern._id,
          supervisor: req.user._id,
        });
        created.push(doc);

        // Notify the intern
        const io = req.app.locals.io;
        createNotification(io, {
          recipient: intern._id,
          type:      'required_day_assigned',
          title:     '📅 Office Day Assigned',
          message:   `You're required to come in on ${normalizedDate.toDateString()}.`,
        });
      } catch (err) {
        // Duplicate (already assigned this intern on this date) — skip silently
        if (err.code === 11000) {
          skipped.push(intern.name);
        } else {
          throw err;
        }
      }
    }

    res.status(201).json({ created, skipped });
  } catch (err) {
    console.error('createRequiredDays error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/required-days/by-date/:date
// Supervisor: list of own interns required on a specific date
const getRequiredDaysByDate = async (req, res) => {
  try {
    const normalizedDate = toMidnightUTC(req.params.date);

    const entries = await RequiredDay.find({
      supervisor: req.user._id,
      date:       normalizedDate,
    })
      .populate('intern', 'name email avatar university')
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (err) {
    console.error('getRequiredDaysByDate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET /api/required-days/month/:year/:month 
// Supervisor: lightweight summary for calendar grid — which dates have entries,
// and how many are unavailable (so the UI can show a warning dot).
// month is 1-indexed (1 = January) to match how frontend date pickers usually work.
const getMonthSummary = async (req, res) => {
  try {
    const year  = Number(req.params.year);
    const month = Number(req.params.month); // 1-12

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth    = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const entries = await RequiredDay.find({
      supervisor: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).select('date status');

    // Group by date string (YYYY-MM-DD) → { total, unavailable }
    const summary = {};
    for (const entry of entries) {
      const key = entry.date.toISOString().split('T')[0];
      if (!summary[key]) summary[key] = { total: 0, unavailable: 0 };
      summary[key].total += 1;
      if (entry.status === 'unavailable') summary[key].unavailable += 1;
    }

    res.json(summary);
  } catch (err) {
    console.error('getMonthSummary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//  GET /api/required-days/my 
// Intern: own upcoming + recent required days
const getMyRequiredDays = async (req, res) => {
  try {
    const entries = await RequiredDay.find({ intern: req.user._id })
      .populate('supervisor', 'name')
      .sort({ date: 1 });

    res.json(entries);
  } catch (err) {
    console.error('getMyRequiredDays error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/required-days/:id/respond 
// Intern: mark unavailable with a reason (or revert back to confirmed)
const respondToRequiredDay = async (req, res) => {
  try {
    const { status, reason } = req.body; // status: 'confirmed' | 'unavailable'

    if (!['confirmed', 'unavailable'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (status === 'unavailable' && !reason?.trim()) {
      return res.status(400).json({ message: 'A reason is required when marking unavailable' });
    }

    const entry = await RequiredDay.findOne({
      _id:    req.params.id,
      intern: req.user._id,
    });
    if (!entry) return res.status(404).json({ message: 'Required day not found' });

    entry.status = status;
    entry.unavailableReason = status === 'unavailable' ? reason.trim() : null;
    entry.supervisorReply    = null; // reset any prior reply on resubmission
    await entry.save();

    if (status === 'unavailable') {
      const io = req.app.locals.io;
      createNotification(io, {
        recipient: entry.supervisor,
        type:      'required_day_unavailable',
        title:     `⚠️ ${req.user.name} can't make it`,
        message:   `${req.user.name} marked ${entry.date.toDateString()} as unavailable: "${reason.trim()}"`,
      });
    }

    res.json(entry);
  } catch (err) {
    console.error('respondToRequiredDay error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/required-days/:id/reply 
// Supervisor: reply to an intern's unavailable reason
const replyToRequiredDay = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply?.trim()) return res.status(400).json({ message: 'Reply message is required' });

    const entry = await RequiredDay.findOne({
      _id:        req.params.id,
      supervisor: req.user._id,
    });
    if (!entry) return res.status(404).json({ message: 'Required day not found' });

    entry.supervisorReply = reply.trim();
    await entry.save();

    const io = req.app.locals.io;
    createNotification(io, {
      recipient: entry.intern,
      type:      'required_day_reply',
      title:     '💬 Your supervisor replied',
      message:   `Re: ${entry.date.toDateString()} — "${reply.trim()}"`,
    });

    res.json(entry);
  } catch (err) {
    console.error('replyToRequiredDay error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//DELETE /api/required-days/:id 
// Supervisor: remove a required day assignment
const deleteRequiredDay = async (req, res) => {
  try {
    const entry = await RequiredDay.findOneAndDelete({
      _id:        req.params.id,
      supervisor: req.user._id,
    });
    if (!entry) return res.status(404).json({ message: 'Required day not found' });
    res.json({ message: 'Removed' });
  } catch (err) {
    console.error('deleteRequiredDay error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequiredDays,
  getRequiredDaysByDate,
  getMonthSummary,
  getMyRequiredDays,
  respondToRequiredDay,
  replyToRequiredDay,
  deleteRequiredDay,
};