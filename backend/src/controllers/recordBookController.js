const RecordBook = require('../models/RecordBook');
const User       = require('../models/User');
const PDFDocument = require('pdfkit');

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
// Intern: export daily record as real PDF
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
    const completedCount = record.tasks.filter(t => t.completed).length;
    const moodLabel = { great: 'Great', good: 'Good', okay: 'Okay', tired: 'Tired', stressed: 'Stressed' };

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=record_${record.date.toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    // --- Header ---
    doc.fontSize(22).fillColor('#8b5cf6').font('Helvetica-Bold').text('Daily Record Book', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor('#666').font('Helvetica').text('InternPulse - Intern Daily Log', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#8b5cf6').lineWidth(2).stroke();
    doc.moveDown(0.8);

    // --- Meta info ---
    const metaY = doc.y;
    doc.fontSize(10).fillColor('#333').font('Helvetica-Bold');
    doc.text('Intern:', 50, metaY, { continued: true }).font('Helvetica').text(` ${internName}`);
    doc.text('Email:', 50, metaY + 16, { continued: true }).font('Helvetica').text(` ${internEmail}`);
    doc.text('Date:', 300, metaY, { continued: true }).font('Helvetica').text(` ${dateStr}`);
    doc.text('Hours:', 300, metaY + 16, { continued: true }).font('Helvetica').text(` ${record.officeHours.start} - ${record.officeHours.end}`);
    doc.text('Mood:', 300, metaY + 32, { continued: true }).font('Helvetica').text(` ${moodLabel[record.mood] || record.mood}`);
    doc.y = metaY + 52;
    doc.moveDown(0.8);

    // --- Tasks section ---
    doc.fontSize(13).fillColor('#8b5cf6').font('Helvetica-Bold')
      .text(`Tasks (${completedCount}/${record.tasks.length} completed)`);
    doc.moveDown(0.3);

    if (record.tasks.length > 0) {
      // Table header
      const tableTop = doc.y;
      const colWidths = [30, 280, 80, 105];
      const headers = ['#', 'Task', 'Status', 'Completed At'];
      doc.fontSize(8).fillColor('#666').font('Helvetica-Bold');
      let xPos = 50;
      headers.forEach((h, i) => {
        doc.text(h, xPos, tableTop, { width: colWidths[i], align: i === 0 ? 'center' : 'left' });
        xPos += colWidths[i];
      });
      doc.moveDown(0.4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      doc.moveDown(0.3);

      // Table rows
      record.tasks.forEach((task, i) => {
        const rowY = doc.y;
        if (rowY > 720) { doc.addPage(); }
        const y = doc.y;
        doc.fontSize(9).fillColor('#333').font('Helvetica');
        xPos = 50;
        doc.text(String(i + 1), xPos, y, { width: colWidths[0], align: 'center' });
        xPos += colWidths[0];
        doc.text(task.text, xPos, y, { width: colWidths[1] });
        xPos += colWidths[1];
        const statusColor = task.completed ? '#16a34a' : '#d97706';
        doc.fillColor(statusColor).font('Helvetica-Bold')
          .text(task.completed ? 'Done' : 'Pending', xPos, y, { width: colWidths[2] });
        xPos += colWidths[2];
        doc.fillColor('#666').font('Helvetica')
          .text(task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : '-', xPos, y, { width: colWidths[3] });
        doc.y = y + 18;
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#f0f0f0').lineWidth(0.3).stroke();
        doc.moveDown(0.2);
      });
    } else {
      doc.fontSize(10).fillColor('#999').font('Helvetica-Oblique')
        .text('No tasks recorded for this day.');
    }
    doc.moveDown(0.8);

    // --- Notes ---
    if (record.notes) {
      if (doc.y > 680) doc.addPage();
      doc.fontSize(13).fillColor('#8b5cf6').font('Helvetica-Bold').text('Notes');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333').font('Helvetica');
      doc.roundedRect(50, doc.y, 495, 0, 4).fill('#f9fafb');
      doc.fillColor('#333').text(record.notes, 55, doc.y + 2, { width: 485, lineGap: 3 });
      doc.moveDown(0.8);
    }

    // --- Daily Summary ---
    if (record.summary) {
      if (doc.y > 680) doc.addPage();
      doc.fontSize(13).fillColor('#8b5cf6').font('Helvetica-Bold').text('Daily Summary');
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333').font('Helvetica')
        .text(record.summary, 55, doc.y, { width: 485, lineGap: 3 });
      doc.moveDown(0.8);
    }

    // --- Footer ---
    const footerY = doc.page.height - 60;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
    doc.fontSize(8).fillColor('#999').font('Helvetica')
      .text(`Generated by InternPulse on ${new Date().toLocaleString()}`, 50, footerY + 8, { align: 'center' });

    doc.end();
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
