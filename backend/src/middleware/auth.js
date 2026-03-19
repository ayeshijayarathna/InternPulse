const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT token ──────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — no token provided' });
  }

  try {
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// ── Super Admin only ──────────────────────────────────────────────────────────
const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied — Super Admins only' });
  }
  next();
};

// ── Supervisor only ───────────────────────────────────────────────────────────
const supervisorOnly = (req, res, next) => {
  if (req.user?.role !== 'supervisor') {
    return res.status(403).json({ message: 'Access denied — Supervisors only' });
  }
  next();
};

// ── Intern only ───────────────────────────────────────────────────────────────
const internOnly = (req, res, next) => {
  if (req.user?.role !== 'intern') {
    return res.status(403).json({ message: 'Access denied — Interns only' });
  }
  next();
};

module.exports = { protect, superAdminOnly, supervisorOnly, internOnly };