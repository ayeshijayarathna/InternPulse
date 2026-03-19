const User        = require('../models/User');
const cloudinary  = require('../config/cloudinary');
const { uploadBufferToCloudinary, isImage } = require('../middleware/upload');

// ── GET /api/users/interns ────────────────────────────────────────────────────
// Supervisor: own interns only (createdBy = req.user._id)
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

// ── POST /api/users/intern ────────────────────────────────────────────────────
const createIntern = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    let avatar;
    if (req.file) {
      const resourceType = isImage(req.file.mimetype) ? 'image' : 'raw';
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder:        'internpulse/avatars',
        resource_type: resourceType,
      });
      avatar = { url: result.secure_url, publicId: result.public_id };
    }

    // pre-save hook hashes passwordHash automatically
    const intern = await User.create({
      name,
      email,
      passwordHash: password,
      role:         'intern',
      createdBy:    req.user._id,
      ...(avatar && { avatar }),
    });

    const safe = intern.toObject();
    delete safe.passwordHash;
    res.status(201).json(safe);
  } catch (err) {
    console.error('createIntern error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ── PATCH /api/users/intern/:id ───────────────────────────────────────────────
const updateIntern = async (req, res) => {
  try {
    const intern = await User.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
      role:      'intern',
    });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    const { name, email, password } = req.body;
    if (name)  intern.name  = name;
    if (email) intern.email = email;
    if (password && password.trim()) intern.passwordHash = password; // hook re-hashes

    if (req.file) {
      if (intern.avatar?.publicId)
        await cloudinary.uploader.destroy(intern.avatar.publicId).catch(() => {});
      const result  = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'internpulse/avatars',
        resource_type: isImage(req.file.mimetype) ? 'image' : 'raw',
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

// ── PATCH /api/users/intern/:id/toggle (activate / deactivate) ───────────────
// Keep original name: toggleInternStatus (used in original routes.js)
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
    console.error('toggleInternStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── DELETE /api/users/intern/:id ──────────────────────────────────────────────
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

    await intern.deleteOne();
    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    console.error('deleteIntern error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── PATCH /api/users/avatar (original — keep) ────────────────────────────────
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (user.avatar?.publicId)
      await cloudinary.uploader.destroy(user.avatar.publicId).catch(() => {});

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'internpulse/avatars',
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

// ── Original export kept  ────────────────────────────────────
module.exports = {
  getInterns,
  createIntern,
  updateIntern,
  toggleInternStatus,   
  deleteIntern,
  updateAvatar,
};