const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    passwordHash: {
      type:     String,
      required: [true, 'Password is required'],
    },
    role: {
      type:    String,
      enum:    ['super_admin', 'supervisor', 'intern'],
      default: 'intern',
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    avatar: {
      url:      { type: String, default: null },
      publicId: { type: String, default: null },
    },
    createdBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    //  Intern profile fields (editable by intern)
    university: { type: String, default: null, trim: true },
    hometown:   { type: String, default: null, trim: true },
    cv: {
      filename:     { type: String, default: null }, // saved filename on disk
      originalName: { type: String, default: null },
      fileSize:     { type: Number, default: null },
      uploadedAt:   { type: Date,   default: null },
    },

    //  Internship dates (set by supervisor, read-only for intern) 
    internshipStart: { type: Date, default: null },
    internshipEnd:   { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);