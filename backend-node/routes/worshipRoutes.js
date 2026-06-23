const express = require('express');
const router = express.Router();
const worshipController = require('../controllers/worshipController');
const { allowSelfOrRole, authorize } = require('../middleware/auth');

// GET: siswa hanya bisa akses data sendiri, guru bisa akses semua
router.get('/:userId', allowSelfOrRole('userId', 'guru'), worshipController.getByUser);
router.get('/:userId/history', allowSelfOrRole('userId', 'guru'), worshipController.history);

// POST: siswa/guru bisa simpan data (user_id dari JWT)
router.post('/', authorize('siswa', 'guru'), worshipController.store);

// PUT: siswa hanya bisa update data sendiri
router.put('/:id', authorize('siswa', 'guru'), worshipController.update);

module.exports = router;

