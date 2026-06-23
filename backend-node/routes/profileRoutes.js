const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { allowSelfOrRole, authorize } = require('../middleware/auth');

// Siswa/guru hanya boleh akses profil dirinya sendiri
router.get('/:userId', allowSelfOrRole('userId', 'siswa', 'guru'), profileController.show);
router.put('/:userId', allowSelfOrRole('userId', 'siswa', 'guru'), profileController.update);
router.put(
  '/:userId/password',
  allowSelfOrRole('userId', 'siswa', 'guru'),
  profileController.changePassword
);
router.put(
  '/:userId/photo',
  allowSelfOrRole('userId', 'siswa', 'guru'),
  profileController.uploadPhoto
);

module.exports = router;

