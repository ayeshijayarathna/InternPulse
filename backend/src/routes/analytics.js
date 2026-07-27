const express = require('express');
const router = express.Router();
const { getSupervisorAnalytics } = require('../controllers/analyticsController');
const { protect, supervisorOnly } = require('../middleware/auth');

router.get('/supervisor', protect, supervisorOnly, getSupervisorAnalytics);

module.exports = router;
