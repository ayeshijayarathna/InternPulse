const router = require('express').Router();
const { protect, internOnly } = require('../middleware/auth');
const {
  upsertRecord,
  getMyRecords,
  getRecordByDate,
  getMonthRecords,
  toggleTask,
  deleteTask,
  deleteRecord,
  exportRecordPDF,
  getRecordStats,
} = require('../controllers/recordBookController');

router.use(protect, internOnly);

router.get('/stats',               getRecordStats);
router.get('/export/:date',        exportRecordPDF);
router.get('/month/:year/:month',  getMonthRecords);
router.get('/:date',               getRecordByDate);
router.get('/',                    getMyRecords);

router.post('/',                   upsertRecord);

router.patch('/:id/task/:taskId',  toggleTask);

router.delete('/:id/task/:taskId', deleteTask);
router.delete('/:id',              deleteRecord);

module.exports = router;
