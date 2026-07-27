const router = require('express').Router();
const { protect, supervisorOnly, internOnly, superAdminOnly } = require('../middleware/auth');
const {
  createInquiry, getMyInquiries, getInquiries,
  replyInquiry, updateInquiry, deleteInquiry, closeInquiry,
  createAdminInquiry, getAdminInquiries, getMyAdminInquiries,
  replyAdminInquiry, closeAdminInquiry,
} = require('../controllers/inquiryController');

// Intern routes
router.post('/',         protect, internOnly,    createInquiry);
router.get('/my',        protect, internOnly,    getMyInquiries);
router.patch('/:id',     protect, internOnly,    updateInquiry);
router.delete('/:id',    protect, internOnly,    deleteInquiry);

// Supervisor routes (intern inquiries)
router.get('/',               protect, supervisorOnly, getInquiries);
router.post('/:id/reply',     protect, supervisorOnly, replyInquiry);
router.patch('/:id/status',   protect, supervisorOnly, closeInquiry);

// Admin inquiry routes
router.post('/admin',              protect, superAdminOnly,  createAdminInquiry);
router.get('/admin',               protect, superAdminOnly,  getAdminInquiries);
router.get('/admin/mine',          protect, supervisorOnly,  getMyAdminInquiries);
router.post('/admin/:id/reply',    protect, supervisorOnly,  replyAdminInquiry);
router.patch('/admin/:id/status',  protect, superAdminOnly,  closeAdminInquiry);

module.exports = router;
