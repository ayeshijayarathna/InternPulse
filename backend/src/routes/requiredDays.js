const router = require('express').Router();
const { protect, supervisorOnly, internOnly } = require('../middleware/auth');
const {
  createRequiredDays,
  getRequiredDaysByDate,
  getMonthSummary,
  getMyRequiredDays,
  respondToRequiredDay,
  replyToRequiredDay,
  deleteRequiredDay,
} = require('../controllers/requiredDayController');

//  Supervisor routes 
router.post('/',                         protect, supervisorOnly, createRequiredDays);
router.get('/by-date/:date',             protect, supervisorOnly, getRequiredDaysByDate);
router.get('/month/:year/:month',        protect, supervisorOnly, getMonthSummary);
router.post('/:id/reply',                protect, supervisorOnly, replyToRequiredDay);
router.delete('/:id',                    protect, supervisorOnly, deleteRequiredDay);

// Intern routes
router.get('/my',                        protect, internOnly, getMyRequiredDays);
router.patch('/:id/respond',             protect, internOnly, respondToRequiredDay);

module.exports = router;