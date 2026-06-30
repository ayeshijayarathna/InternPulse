const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'task_assigned',       // supervisor assigned a task
        'task_deadline',       // 7-day reminder
        'submission_received', // supervisor: intern submitted
        'welcome',             // intern account created
        'announcement',        // supervisor: new announcement from super admin
        'inquiry_received',    // supervisor: intern sent inquiry
        'inquiry_reply',       // intern: supervisor replied
        'required_day_assigned',     // intern: supervisor scheduled an office day
        'required_day_unavailable',  // supervisor: intern can't make a required day
        'required_day_reply',        // intern: supervisor replied to their reason
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    // optional linked documents
    taskId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Task',         default: null },
    updateId:       { type: mongoose.Schema.Types.ObjectId, ref: 'TaskUpdate',   default: null },
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement', default: null },
    inquiryId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry',      default: null },
    requiredDayId:  { type: mongoose.Schema.Types.ObjectId, ref: 'RequiredDay',  default: null },
  },
  { timestamps: true }
);

// index for fast per-user queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);