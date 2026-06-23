const multer = require('multer');
const path = require('path');
const { success, failure } = require('../utils/response');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Tipe file tidak diizinkan'));
  },
}).single('file');

exports.upload = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return failure(res, `Upload error: ${err.message}`, 400);
      }
      return failure(res, err.message || 'Upload gagal', 400);
    }

    if (!req.file) {
      return failure(res, 'File tidak ditemukan', 400);
    }

    const url = `/uploads/${req.file.filename}`;
    return success(res, { url, filename: req.file.filename });
  });
};
