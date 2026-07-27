const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const inquirySchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    // who created this inquiry
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
    // supervisor this intern belongs to (for intern inquiries)
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },
    // target admin for supervisor-to-admin inquiries
    targetAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },
    // inquiry type: 'intern' (intern→supervisor) or 'admin' (super admin↔supervisor)
    type: {
      type: String,
      enum: ['intern', 'admin'],
      default: 'intern',
    },
    status: {
      type:    String,
      enum:    ['open', 'replied', 'closed'],
      default: 'open',
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
