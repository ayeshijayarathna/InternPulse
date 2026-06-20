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
    // intern who sent
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
    // supervisor this intern belongs to
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
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