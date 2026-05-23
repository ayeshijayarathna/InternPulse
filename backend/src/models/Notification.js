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
      ],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    // optional linked documents
    taskId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Task',   default: null },
    updateId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskUpdate', default: null },
  },
  { timestamps: true }
);

// index for fast per-user queries
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
