const mongoose = require('mongoose');

// tasks collection
// assignedTo is now an ARRAY to support multiple intern assignments per task
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
    // ← Changed from single ObjectId to array of ObjectIds
    assignedTo: {
      type:    [mongoose.Schema.Types.ObjectId],
      ref:     'User',
      default: [],
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
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);