const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    filename:     { type: String, required: true }, // saved filename on disk
    originalName: { type: String, required: true }, // original upload name
    fileType:     { type: String, required: true }, // MIME type
    fileSize:     { type: Number },                 // bytes
    path:         { type: String },                 // absolute server path (internal)
  },
  { _id: false }
);

const taskUpdateSchema = new mongoose.Schema(
  {
    taskId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Task',
      default: null,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    type: {
      type:    String,
      enum:    ['update', 'blocker', 'self_task'],
      default: 'update',
    },
    content: {
      type:     String,
      required: [true, 'Content is required'],
      trim:     true,
    },
    locked: {
      type:    Boolean,
      default: true,
    },
    attachments: {
      type:    [attachmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskUpdate', taskUpdateSchema);