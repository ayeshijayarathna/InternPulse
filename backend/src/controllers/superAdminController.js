const User       = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { uploadBufferToCloudinary } = require('../middleware/upload');

// ── One-time seed ─────────────────────────────────────────────────────────────
const seedSuperAdmin = async (req, res) => {
  try {
    const exists = await User.findOne({ role: 'super_admin' });
    if (exists) return res.status(400).json({ message: 'Super admin already exists' });

    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, password required' });

    const sa = await User.create({ name, email, passwordHash: password, role: 'super_admin' });
    const safe = sa.toObject(); delete safe.passwordHash;
    res.status(201).json({ message: 'Super admin created', user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create supervisor ─────────────────────────────────────────────────────────
const createSupervisor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email, password required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    let avatar;
    if (req.file) {
      const result = await uploadBufferToCloudinary(req.file.buffer, { folder: 'internpulse/avatars' });
      avatar = { url: result.secure_url, publicId: result.public_id };
    }

    const sup = await User.create({
      name, email,
      passwordHash: password,
      role:         'supervisor',
      createdBy:    req.user._id,
      ...(avatar && { avatar }),
    });
    const safe = sup.toObject(); delete safe.passwordHash;
    res.status(201).json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── List all supervisors with internCount ─────────────────────────────────────
const getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: 'supervisor' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    const withCount = await Promise.all(
      supervisors.map(async (sup) => {
        const internCount = await User.countDocuments({ role: 'intern', createdBy: sup._id });
        return { ...sup.toObject(), internCount };
      })
    );

    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get one supervisor ────────────────────────────────────────────────────────
const getSupervisorById = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' })
      .select('-passwordHash');
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    const internCount = await User.countDocuments({ role: 'intern', createdBy: sup._id });
    res.json({ ...sup.toObject(), internCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Edit supervisor ───────────────────────────────────────────────────────────
const updateSupervisor = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    const { name, email, password } = req.body;
    if (name)  sup.name  = name;
    if (email) sup.email = email;
    if (password && password.trim()) sup.passwordHash = password;

    if (req.file) {
      if (sup.avatar?.publicId)
        await cloudinary.uploader.destroy(sup.avatar.publicId).catch(() => {});
      const result = await uploadBufferToCloudinary(req.file.buffer, { folder: 'internpulse/avatars' });
      sup.avatar = { url: result.secure_url, publicId: result.public_id };
    }

    await sup.save();
    const safe = sup.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Toggle supervisor active/inactive ────────────────────────────────────────
const toggleSupervisorStatus = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    sup.isActive = !sup.isActive;
    await sup.save();
    const safe = sup.toObject(); delete safe.passwordHash;
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete supervisor ─────────────────────────────────────────────────────────
const deleteSupervisor = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    if (sup.avatar?.publicId)
      await cloudinary.uploader.destroy(sup.avatar.publicId).catch(() => {});

    await sup.deleteOne();
    res.json({ message: 'Supervisor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get interns of a specific supervisor (read-only) ─────────────────────────
const getSupervisorInterns = async (req, res) => {
  try {
    const sup = await User.findOne({ _id: req.params.id, role: 'supervisor' });
    if (!sup) return res.status(404).json({ message: 'Supervisor not found' });

    const interns = await User.find({ role: 'intern', createdBy: sup._id })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json(interns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  seedSuperAdmin,
  createSupervisor,
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  toggleSupervisorStatus,
  deleteSupervisor,
  getSupervisorInterns,
};