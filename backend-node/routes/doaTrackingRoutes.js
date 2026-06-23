const express = require('express');
const router = express.Router();
const doaTrackingController = require('../controllers/doaTrackingController');
const { allowSelfOrRole, authorize } = require('../middleware/auth');

// Siswa/Guru hanya boleh akses doa tracking miliknya
router.get('/:userId', allowSelfOrRole('userId', 'siswa', 'guru'), doaTrackingController.index);

// Toggle doa tracking menggunakan user_id dari body (controller perlu dirapikan di step response contract)
router.post('/', authorize('siswa', 'guru'), doaTrackingController.toggle);

module.exports = router;

