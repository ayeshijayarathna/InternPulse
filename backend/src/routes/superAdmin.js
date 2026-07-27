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
  getAnalytics,
  exportSupervisorsCSV,
  exportInternsCSV,
  exportHierarchyCSV,
  exportTasksCSV,
  exportFullReportCSV,
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

// Analytics
router.get('/analytics',                   protect, superAdminOnly, getAnalytics);

// Reports / CSV exports
router.get('/reports/supervisors',         protect, superAdminOnly, exportSupervisorsCSV);
router.get('/reports/interns',             protect, superAdminOnly, exportInternsCSV);
router.get('/reports/hierarchy',           protect, superAdminOnly, exportHierarchyCSV);
router.get('/reports/tasks',               protect, superAdminOnly, exportTasksCSV);
router.get('/reports/full',                protect, superAdminOnly, exportFullReportCSV);

module.exports = router;