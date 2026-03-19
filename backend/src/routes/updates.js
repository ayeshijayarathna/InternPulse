const express = require('express');
const router  = express.Router();

const {
  createUpdate,
  getAllUpdates,
  getMyUpdates,
  blockEdit,
  blockDelete,
} = require('../controllers/updateController');

const { protect, supervisorOnly, internOnly } = require('../middleware/auth');
const { uploadAny }                           = require('../middleware/upload');

//GET /api/updates/my  (Intern: own history — read-only)
router.get('/my', protect, getMyUpdates);

// POST /api/updates  (Intern submits update/self-task)
// Supports up to 5 file attachments: images + pdf/word/zip/excel/pptx
router.post(
  '/',
  protect,
  internOnly,
  uploadAny.array('attachments', 5),
  createUpdate
);

//GET /api/updates  (Supervisor: all submissions)
router.get('/', protect, supervisorOnly, getAllUpdates);

//"Backend must return 403 if attempted" (edit/delete blocked)
router.put('/:id',    protect, blockEdit);
router.patch('/:id',  protect, blockEdit);
router.delete('/:id', protect, blockDelete);

module.exports = router;