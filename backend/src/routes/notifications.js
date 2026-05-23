const router  = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} = require('../controllers/notificationController');

router.use(protect);

router.get('/',                      getNotifications);
router.get('/unread-count',          getUnreadCount);
router.patch('/:id/read',            markRead);
router.patch('/mark-all-read',       markAllRead);

module.exports = router;
