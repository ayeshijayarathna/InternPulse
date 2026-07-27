const RecordBook = require('../models/RecordBook');
const User       = require('../models/User');

const toMidnightUTC = (input) => {
  const d = new Date(input);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// POST /api/record-book
// Intern: create or update daily record
const upsertRecord = async (req, res) => {
  try {
    const { date, tasks, notes, officeHours, mood, summary } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const normalizedDate = toMidnightUTC(date);

    const record = await RecordBook.findOneAndUpdate(
      { intern: req.user._id, date: normalizedDate },
      {
        $set: {
          notes:       notes       || '',
          officeHours: officeHours || { start: '09:00', end: '17:00' },
          mood:        mood        || 'good',
          summary:     summary     || '',
        },
        $push: {
          tasks: {
            $each: (tasks || []).map(t => ({
              text:      t.text,
              completed: t.completed || false,
              completedAt: t.completed ? new Date() : null,
            })),
          },
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/record-book
// Intern: get all records
const getMyRecords = async (req, res) => {
  try {
    const records = await RecordBook.find({ intern: req.user._id })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/record-book/:date
// Intern: get record for specific date
const getRecordByDate = async (req, res) => {
  try {
    const normalizedDate = toMidnightUTC(req.params.date);
    const record = await RecordBook.findOne({
      intern: req.user._id,
      date:   normalizedDate,
    });
    res.json(record || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/record-book/month/:year/:month
// Intern: get summary for calendar view
const getMonthRecords = async (req, res) => {
  try {
    const year  = Number(req.params.year);
    const month = Number(req.params.month);

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth   = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    const records = await RecordBook.find({
      intern: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).select('date tasks notes mood summary officeHours');

    const summary = {};
    for (const rec of records) {
      const key = rec.date.toISOString().split('T')[0];
      const completedCount = rec.tasks.filter(t => t.completed).length;
      summary[key] = {
        hasRecord:     true,
        taskCount:     rec.tasks.length,
        completedCount,
        mood:          rec.mood,
        hasNotes:      !!rec.notes,
        hasSummary:    !!rec.summary,
      };
    }

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/record-book/:id/task/:taskId
// Intern: toggle task completion
const toggleTask = async (req, res) => {
  try {
    const record = await RecordBook.findOne({
      _id:    req.params.id,
      intern: req.user._id,
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const task = record.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.completed   = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/record-book/:id/task/:taskId
// Intern: delete a task item
const deleteTask = async (req, res) => {
  try {
    const record = await RecordBook.findOne({
      _id:    req.params.id,
      intern: req.user._id,
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });

    record.tasks.pull(req.params.taskId);
    await record.save();

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/record-book/:id
// Intern: delete entire record
const deleteRecord = async (req, res) => {
  try {
    const record = await RecordBook.findOneAndDelete({
      _id:    req.params.id,
      intern: req.user._id,
    });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/record-book/export/:date
// Intern: export daily record as printable HTML (PDF via browser print)
const exportRecordPDF = async (req, res) => {
  try {
    const normalizedDate = toMidnightUTC(req.params.date);
    const record = await RecordBook.findOne({
      intern: req.user._id,
      date:   normalizedDate,
    }).populate('intern', 'name email');

    if (!record) return res.status(404).json({ message: 'No record found for this date' });

    const internName  = record.intern.name;
    const internEmail = record.intern.email;
    const dateStr     = new Date(record.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const tasksHTML = record.tasks.map((t, i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${t.text}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">
          <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;
            ${t.completed
              ? 'background:#dcfce7;color:#16a34a;'
              : 'background:#fef3c7;color:#d97706;'}">
            ${t.completed ? 'Done' : 'Pending'}
          </span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:12px;color:#666;">
          ${t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : '-'}
        </td>
      </tr>
    `).join('');

    const completedCount = record.tasks.filter(t => t.completed).length;
    const moodEmoji = { great: '😄', good: '🙂', okay: '😐', tired: '😴', stressed: '😰' };

    const html = `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <title>Daily Record - ${dateStr}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 1.5cm; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #8b5cf6; }
    .header h1 { font-size: 24px; color: #8b5cf6; margin-bottom: 5px; }
    .header p { color: #666; font-size: 14px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; color: #8b5cf6; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; }
    .notes, .summary { padding: 12px 16px; background: #f9fafb; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; color: #666; }
    .meta span { display: inline-flex; align-items: center; gap: 6px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f3f4f6; }
  </style>
</head><body>
  <div class="header">
    <h1>📋 Daily Record Book</h1>
    <p>InternPulse - Intern Daily Log</p>
  </div>
  <div class="meta">
    <span><strong>Intern:</strong> ${internName}</span>
    <span><strong>Email:</strong> ${internEmail}</span>
  </div>
  <div class="meta">
    <span><strong>Date:</strong> ${dateStr}</span>
    <span><strong>Hours:</strong> ${record.officeHours.start} - ${record.officeHours.end}</span>
    <span><strong>Mood:</strong> ${moodEmoji[record.mood] || '🙂'} ${record.mood}</span>
  </div>
  <div class="section">
    <h2>Tasks (${completedCount}/${record.tasks.length} completed)</h2>
    ${record.tasks.length > 0 ? `
    <table>
      <thead><tr><th>#</th><th>Task</th><th>Status</th><th>Completed At</th></tr></thead>
      <tbody>${tasksHTML}</tbody>
    </table>` : '<p style="color:#999;font-size:14px;">No tasks recorded for this day.</p>'}
  </div>
  ${record.notes ? `<div class="section"><h2>Notes</h2><div class="notes">${record.notes}</div></div>` : ''}
  ${record.summary ? `<div class="section"><h2>Daily Summary</h2><div class="summary">${record.summary}</div></div>` : ''}
  <div class="footer">
    <p>Generated by InternPulse on ${new Date().toLocaleString()}</p>
  </div>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename=record_${record.date.toISOString().split('T')[0]}.html`);
    res.send(html);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/record-book/stats
// Intern: overall record book statistics
const getRecordStats = async (req, res) => {
  try {
    const records = await RecordBook.find({ intern: req.user._id });

    let totalTasks = 0;
    let completedTasks = 0;
    let totalDays = records.length;
    let totalNotes = 0;
    let moodCounts = {};

    records.forEach(rec => {
      totalTasks += rec.tasks.length;
      completedTasks += rec.tasks.filter(t => t.completed).length;
      if (rec.notes) totalNotes++;
      moodCounts[rec.mood] = (moodCounts[rec.mood] || 0) + 1;
    });

    const firstRecord = records.length > 0
      ? records.reduce((min, r) => r.date < min.date ? r : min, records[0])
      : null;
    const lastRecord = records.length > 0
      ? records.reduce((max, r) => r.date > max.date ? r : max, records[0])
      : null;

    res.json({
      totalDays,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalNotes,
      moodDistribution: moodCounts,
      firstRecordDate: firstRecord?.date || null,
      lastRecordDate: lastRecord?.date || null,
      streak: calculateStreak(records),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function calculateStreak(records) {
  if (records.length === 0) return 0;
  const dates = records
    .map(r => r.date.toISOString().split('T')[0])
    .sort()
    .reverse();

  let streak = 1;
  const today = new Date().toISOString().split('T')[0];

  if (dates[0] !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dates[0] !== yesterday.toISOString().split('T')[0]) return 0;
  }

  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

module.exports = {
  upsertRecord,
  getMyRecords,
  getRecordByDate,
  getMonthRecords,
  toggleTask,
  deleteTask,
  deleteRecord,
  exportRecordPDF,
  getRecordStats,
};
