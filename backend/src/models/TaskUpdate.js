const mongoose = require('mongoose');

// taskUpdates collection
// Fields: taskId (nullable), createdBy (intern), type (update/blocker/self_task),
//         content, createdAt, locked
// Extra: attachments[] — for zip/pdf/word/image uploads via Cloudinary

const attachmentSchema = new mongoose.Schema(
  {
    url:          { type: String, required: true },  // Cloudinary secure URL
    publicId:     { type: String, required: true },  // Cloudinary public_id
    originalName: { type: String, required: true },  // Original filename
    fileType:     { type: String, required: true },  // MIME type
    fileSize:     { type: Number },                  // Size in bytes
    resourceType: {
      type:    String,
      enum:    ['image', 'raw'],
      default: 'raw',
    },
  },
  { _id: false }
);

const taskUpdateSchema = new mongoose.Schema(
  {
    // nullable — intern can submit a self_task without linking to a task
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
    // locked = true always — intern CANNOT edit or delete after submit (PDF rule)
    locked: {
      type:    Boolean,
      default: true,
    },
    // Extra: file attachments (pdf, word, zip, images)
    attachments: {
      type:    [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

module.exports = mongoose.model('TaskUpdate', taskUpdateSchema);