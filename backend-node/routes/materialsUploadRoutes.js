const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const materialsUploadController = require('../controllers/materialsUploadController');

// POST /api/materials/upload
// (frontend calls POST /materials/upload)
router.post('/upload', authorize('guru'), materialsUploadController.upload);

module.exports = router;


