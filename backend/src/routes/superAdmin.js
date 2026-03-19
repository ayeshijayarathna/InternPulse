const express = require('express');
const router  = express.Router();

const {
  seedSuperAdmin,
  createSupervisor,
  getSupervisors,
  getSupervisorById,
  updateSupervisor,
  toggleSupervisorStatus,
  deleteSupervisor,
  getSupervisorInterns,
} = require('../controllers/superAdminController');

const { protect, superAdminOnly } = require('../middleware/auth');
const { uploadAny }               = require('../middleware/upload');

// Seed — run once, no auth needed
router.post('/seed', seedSuperAdmin);

// All routes below require super_admin role
router.post('/supervisors',
  protect, superAdminOnly,
  uploadAny.single('avatar'),
  createSupervisor
);

router.get('/supervisors',                  protect, superAdminOnly, getSupervisors);
router.get('/supervisors/:id',              protect, superAdminOnly, getSupervisorById);
router.patch('/supervisors/:id',
  protect, superAdminOnly,
  uploadAny.single('avatar'),
  updateSupervisor
);
router.patch('/supervisors/:id/toggle',    protect, superAdminOnly, toggleSupervisorStatus);
router.delete('/supervisors/:id',          protect, superAdminOnly, deleteSupervisor);
router.get('/supervisors/:id/interns',     protect, superAdminOnly, getSupervisorInterns);

module.exports = router;