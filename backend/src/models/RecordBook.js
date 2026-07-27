const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema(
  {
    text:     { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: true, timestamps: true }
);

const recordBookSchema = new mongoose.Schema(
  {
    intern: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    date: {
      type:     Date,
      required: [true, 'Date is required'],
    },
    tasks: {
      type:    [taskItemSchema],
      default: [],
    },
    notes: {
      type:    String,
      default: '',
      trim:    true,
    },
    officeHours: {
      start: { type: String, default: '09:00' },
      end:   { type: String, default: '17:00' },
    },
    mood: {
      type:    String,
      enum:    ['great', 'good', 'okay', 'tired', 'stressed'],
      default: 'good',
    },
    summary: {
      type:    String,
      default: '',
      trim:    true,
    },
  },
  { timestamps: true }
);

recordBookSchema.index({ intern: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RecordBook', recordBookSchema);
