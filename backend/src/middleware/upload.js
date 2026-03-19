const multer                        = require('multer');
const { CloudinaryStorage }         = require('multer-storage-cloudinary');
const streamifier                   = require('streamifier');
const cloudinary                    = require('../config/cloudinary');

// ── Allowed MIME types ───────────────────────────────────────────────────────
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const DOCUMENT_MIMES = [
  'application/pdf',                                                              // .pdf
  'application/msword',                                                           // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',     // .docx
  'application/vnd.ms-excel',                                                    // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',           // .xlsx
  'application/vnd.ms-powerpoint',                                               // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',   // .pptx
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'text/plain',
];

const ALL_ALLOWED_MIMES = [...IMAGE_MIMES, ...DOCUMENT_MIMES];

// ── Image upload (Cloudinary — image resource type) ──────────────────────────
// Used for: intern avatar, profile pictures
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'intern-tracker/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation:  [{ width: 1200, crop: 'limit' }],
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    IMAGE_MIMES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only image files are allowed (jpg, png, gif, webp)'), false);
  },
});

// ── Document upload (Cloudinary — raw resource type) ─────────────────────────
// Used for: task submission attachments (pdf, word, zip …)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder:        'intern-tracker/documents',
    resource_type: 'raw',
    public_id:     `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
  }),
});

const uploadDocument = multer({
  storage: documentStorage,
  limits:  { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    DOCUMENT_MIMES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('File type not allowed. Accepted: PDF, Word, Excel, PowerPoint, ZIP, TXT'), false);
  },
});

// ── Mixed upload (memory buffer — detect & route to Cloudinary manually) ─────
// Used for: submission attachments (can be image OR document)
const uploadAny = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    ALL_ALLOWED_MIMES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('File type not allowed'), false);
  },
});

// ── Helper: upload a buffer directly to Cloudinary ───────────────────────────
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
  uploadDocument,
  uploadAny,
  uploadBufferToCloudinary,
  isImage,
  ALL_ALLOWED_MIMES,
};