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
  getSupervisorsJSON,
  getInternsJSON,
  getHierarchyJSON,
  getTasksJSON,
  getFullReportJSON,
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

// JSON report endpoints (for PDF generation)
router.get('/reports-json/supervisors',    protect, superAdminOnly, getSupervisorsJSON);
router.get('/reports-json/interns',        protect, superAdminOnly, getInternsJSON);
router.get('/reports-json/hierarchy',      protect, superAdminOnly, getHierarchyJSON);
router.get('/reports-json/tasks',          protect, superAdminOnly, getTasksJSON);
router.get('/reports-json/full',           protect, superAdminOnly, getFullReportJSON);

module.exports = router;