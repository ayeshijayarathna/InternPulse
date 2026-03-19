const mongoose = require('mongoose');

// tasks collection
// Fields: title, description, createdBy, assignedTo, priority, status, dueDate, timestamps
const taskSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Task title is required'],
      trim:     true,
    },
    description: {
      type:    String,
      default: '',
      trim:    true,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    assignedTo: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type:    String,
      enum:    ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

module.exports = mongoose.model('Task', taskSchema);