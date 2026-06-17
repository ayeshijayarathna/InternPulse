const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const {
  createIntern,
  getInterns,
  updateIntern,
  toggleInternStatus,
  deleteIntern,
  updateAvatar,
  updateProfile,
  uploadCV,
  downloadInternCV,
  getMe,
} = require('../controllers/userController');

const { protect, supervisorOnly, internOnly } = require('../middleware/auth');
const { uploadAny, uploadImage }              = require('../middleware/upload');

//  CV disk storage (PDF/Word, 10MB)
const CV_DIR = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(CV_DIR)) fs.mkdirSync(CV_DIR, { recursive: true });

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CV_DIR),
  filename:    (_req, file,  cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext    = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const uploadCV_multer = multer({
  storage:    cvStorage,
  limits:     { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only PDF and Word documents are allowed for CV'));
  },
});

// Own profile 
router.get('/me', protect, getMe);

// Intern: update own profile (university, hometown, avatar)
router.patch(
  '/profile',
  protect, internOnly,
  uploadImage.single('avatar'),
  updateProfile
);

// Intern: upload own CV
router.post(
  '/cv',
  protect, internOnly,
  uploadCV_multer.single('cv'),
  uploadCV
);

// Any user: update own avatar
router.patch('/avatar', protect, uploadAny.single('avatar'), updateAvatar);

// Supervisor: intern CRUD 
router.get('/interns', protect, supervisorOnly, getInterns);

router.post(
  '/intern',
  protect, supervisorOnly,
  uploadAny.single('avatar'),
  createIntern
);

// NOTE: specific routes BEFORE /:id param routes
router.patch('/intern/:id/toggle', protect, supervisorOnly, toggleInternStatus);

// Supervisor: download intern CV
router.get('/intern/:id/cv', protect, supervisorOnly, downloadInternCV);

router.patch(
  '/intern/:id',
  protect, supervisorOnly,
  uploadAny.single('avatar'),
  updateIntern
);

router.delete('/intern/:id', protect, supervisorOnly, deleteIntern);

module.exports = router;