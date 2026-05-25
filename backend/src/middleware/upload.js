const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const streamifier = require('streamifier');
const cloudinary  = require('../config/cloudinary');

// Allowed MIME types 
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const DOCUMENT_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'text/plain',
];

const ALL_ALLOWED_MIMES = [...IMAGE_MIMES, ...DOCUMENT_MIMES];

// Uploads folder: backend/uploads/attachments/
const UPLOADS_DIR = path.join(__dirname, '../../uploads/attachments');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Disk storage for submission attachments 
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file,  cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext    = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

// uploadAny — saves files to local disk (submissions)
const uploadAny = multer({
  storage:    diskStorage,
  limits:     { fileSize: 20 * 1024 * 1024 }, // 20 MB per file
  fileFilter: (req, file, cb) => {
    ALL_ALLOWED_MIMES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('File type not allowed'), false);
  },
});

// Avatar upload → Cloudinary memory (images only, 5MB) 
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    IMAGE_MIMES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only image files are allowed (jpg, png, gif, webp)'), false);
  },
});

//  Helper: upload image buffer to Cloudinary (avatars only) 
const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

const isImage = (mimetype) => IMAGE_MIMES.includes(mimetype);

module.exports = {
  uploadImage,
  uploadAny,
  uploadBufferToCloudinary,
  isImage,
  ALL_ALLOWED_MIMES,
  UPLOADS_DIR,
};