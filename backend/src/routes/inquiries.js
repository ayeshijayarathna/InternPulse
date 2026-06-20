const router = require('express').Router();
const { protect, supervisorOnly, internOnly } = require('../middleware/auth');
const {
  createInquiry, getMyInquiries, getInquiries,
  replyInquiry, updateInquiry, deleteInquiry, closeInquiry,
} = require('../controllers/inquiryController');

// Intern routes
router.post('/',         protect, internOnly,    createInquiry);
router.get('/my',        protect, internOnly,    getMyInquiries);
router.patch('/:id',     protect, internOnly,    updateInquiry);
router.delete('/:id',    protect, internOnly,    deleteInquiry);

// Supervisor routes
router.get('/',               protect, supervisorOnly, getInquiries);
router.post('/:id/reply',     protect, supervisorOnly, replyInquiry);
router.patch('/:id/status',   protect, supervisorOnly, closeInquiry);

module.exports = router;