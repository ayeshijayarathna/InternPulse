const router = require('express').Router();
const { protect, superAdminOnly, supervisorOnly } = require('../middleware/auth');
const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

// Both super admin and supervisors can GET
router.get('/',    protect, getAnnouncements);

// Super admin only — create, edit, delete
router.post('/',   protect, superAdminOnly, createAnnouncement);
router.patch('/:id',  protect, superAdminOnly, updateAnnouncement);
router.delete('/:id', protect, superAdminOnly, deleteAnnouncement);

module.exports = router;