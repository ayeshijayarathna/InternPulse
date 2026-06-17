const path      = require('path');
const fs        = require('fs');
const User      = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadBufferToCloudinary, isImage } = require('../middleware/upload');
const { sendWelcomeMail }    = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

// CV uploads folder
const CV_DIR = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(CV_DIR)) fs.mkdirSync(CV_DIR, { recursive: true });

//GET /api/users/interns
const getInterns = async (req, res) => {
  try {
    const interns = await User.find({
      role:      'intern',
      createdBy: req.user._id,
    })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(interns);
  } catch (err) {
    console.error('getInterns error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/intern 
const createIntern = async (req, res) => {
  try {
    const { name, email, password, internshipStart, internshipEnd } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    let avatar;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder:        'internpulse/avatars',
        resource_type: 'image',
      });
      avatar = { url: result.secure_url, publicId: result.public_id };
    }

    const intern = await User.create({
      name,
      email,
      passwordHash:    password,
      role:            'intern',
      createdBy:       req.user._id,
      internshipStart: internshipStart || null,
      internshipEnd:   internshipEnd   || null,
      ...(avatar && { avatar }),
    });

    const safe = intern.toObject();
    delete safe.passwordHash;

    // Welcome email
    sendWelcomeMail({ name, email, password }).catch(err =>
      console.error('Welcome email error:', err)
    );

    // In-app welcome notification
    const io = req.app.locals.io;
    createNotification(io, {
      recipient: intern._id,
      type:      'welcome',
      title:     '👋 Welcome to InternPulse!',
      message:   `Hi ${name}, your account has been created. Check your email for login credentials.`,
    });

    res.status(201).json(safe);
  } catch (err) {
    console.error('createIntern error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// PATCH /api/users/intern/:id
const updateIntern = async (req, res) => {
  try {
    const intern = await User.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
      role:      'intern',
    });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    const { name, email, password, internshipStart, internshipEnd } = req.body;
    if (name)  intern.name  = name;
    if (email) intern.email = email;
    if (password && password.trim()) intern.passwordHash = password;
    if (internshipStart !== undefined) intern.internshipStart = internshipStart || null;
    if (internshipEnd   !== undefined) intern.internshipEnd   = internshipEnd   || null;

    if (req.file) {
      if (intern.avatar?.publicId)
        await cloudinary.uploader.destroy(intern.avatar.publicId).catch(() => {});
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder:        'internpulse/avatars',
        resource_type: 'image',
      });
      intern.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    await intern.save();
    const safe = intern.toObject();
    delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    console.error('updateIntern error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// PATCH /api/users/intern/:id/toggle 
const toggleInternStatus = async (req, res) => {
  try {
    const intern = await User.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
      role:      'intern',
    });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    intern.isActive = !intern.isActive;
    await intern.save();
    const safe = intern.toObject();
    delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/intern/:id 
const deleteIntern = async (req, res) => {
  try {
    const intern = await User.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
      role:      'intern',
    });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    if (intern.avatar?.publicId)
      await cloudinary.uploader.destroy(intern.avatar.publicId).catch(() => {});

    // Delete CV from disk if exists
    if (intern.cv?.filename) {
      const cvPath = path.join(CV_DIR, intern.cv.filename);
      if (fs.existsSync(cvPath)) fs.unlinkSync(cvPath);
    }

    await intern.deleteOne();
    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    console.error('deleteIntern error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/users/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (user.avatar?.publicId)
      await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder:        'internpulse/avatars',
      resource_type: 'image',
    });
    user.avatar = { url: result.secure_url, publicId: result.public_id };
    await user.save();
    const safe = user.toObject();
    delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//PATCH /api/users/profile
// Intern: update own university, hometown + avatar
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { university, hometown } = req.body;
    if (university !== undefined) user.university = university || null;
    if (hometown   !== undefined) user.hometown   = hometown   || null;

    if (req.file && isImage(req.file.mimetype)) {
      if (user.avatar?.publicId)
        await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder:        'internpulse/avatars',
        resource_type: 'image',
      });
      user.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    await user.save();
    const safe = user.toObject();
    delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//POST /api/users/cv
// Intern: upload own CV to local disk
const uploadCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old CV if exists
    if (user.cv?.filename) {
      const old = path.join(CV_DIR, user.cv.filename);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    user.cv = {
      filename:     req.file.filename,
      originalName: req.file.originalname,
      fileSize:     req.file.size,
      uploadedAt:   new Date(),
    };

    await user.save();
    const safe = user.toObject();
    delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    console.error('uploadCV error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//GET /api/users/intern/:id/cv
// Supervisor: download intern's CV
const downloadInternCV = async (req, res) => {
  try {
    const intern = await User.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
      role:      'intern',
    });
    if (!intern)             return res.status(404).json({ message: 'Intern not found' });
    if (!intern.cv?.filename) return res.status(404).json({ message: 'No CV uploaded' });

    const cvPath = path.join(CV_DIR, intern.cv.filename);
    if (!fs.existsSync(cvPath)) return res.status(404).json({ message: 'CV file not found on server' });

    res.download(cvPath, intern.cv.originalName || intern.cv.filename);
  } catch (err) {
    console.error('downloadInternCV error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInterns,
  createIntern,
  updateIntern,
  toggleInternStatus,
  deleteIntern,
  updateAvatar,
  updateProfile,
  uploadCV,
  downloadInternCV,
  getMe,
};