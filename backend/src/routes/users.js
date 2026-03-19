const express = require('express');
const router  = express.Router();

const {
  createIntern,
  getInterns,
  updateIntern,
  toggleInternStatus,
  deleteIntern,
  updateAvatar,
} = require('../controllers/userController');

const { protect, supervisorOnly } = require('../middleware/auth');
const { uploadAny }               = require('../middleware/upload');

// ── Intern CRUD (supervisor only, own interns) ────────────────────────────────

// POST /api/users/intern — create intern
router.post(
  '/intern',
  protect, supervisorOnly,
  uploadAny.single('avatar'),
  createIntern
);

// GET /api/users/interns — list own interns
router.get('/interns', protect, supervisorOnly, getInterns);

// PATCH /api/users/intern/:id — edit intern
router.patch(
  '/intern/:id',
  protect, supervisorOnly,
  uploadAny.single('avatar'),
  updateIntern
);

// PATCH /api/users/intern/:id/toggle — activate / deactivate
// NOTE: must be declared BEFORE /intern/:id to avoid conflict
router.patch('/intern/:id/toggle', protect, supervisorOnly, toggleInternStatus);

// DELETE /api/users/intern/:id — delete intern
router.delete('/intern/:id', protect, supervisorOnly, deleteIntern);

// PATCH /api/users/avatar — any user can update their own avatar
router.patch('/avatar', protect, uploadAny.single('avatar'), updateAvatar);

module.exports = router;