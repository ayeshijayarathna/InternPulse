const mongoose = require('mongoose');

// One document = one intern required on one specific date.
// Supervisor creates these manually (no auto-recurrence).
const requiredDaySchema = new mongoose.Schema(
  {
    date: {
      // Stored as a normalized UTC midnight date (no time component)
      type:     Date,
      required: [true, 'Date is required'],
    },
    intern: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    supervisor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    status: {
      // confirmed = default, intern is expected to come
      // unavailable = intern marked they can't make it (reason required)
      type:    String,
      enum:    ['confirmed', 'unavailable'],
      default: 'confirmed',
    },
    unavailableReason: {
      type:    String,
      trim:    true,
      default: null,
    },
    supervisorReply: {
      type:    String,
      trim:    true,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast lookups: "who is required on this date for this supervisor"
requiredDaySchema.index({ supervisor: 1, date: 1 });
// Fast lookups: "my upcoming required days" (intern side)
requiredDaySchema.index({ intern: 1, date: 1 });
// Prevent the same intern being double-booked on the same date
requiredDaySchema.index({ intern: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('RequiredDay', requiredDaySchema);