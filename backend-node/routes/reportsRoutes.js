const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { checkRole, allowSelfOrRole } = require('../middleware/auth');

router.get('/student/:userId', checkRole('siswa', 'guru'), allowSelfOrRole('userId', 'guru'), reportsController.student);
router.get('/teacher', checkRole('guru'), reportsController.teacher);
router.get('/export', checkRole('siswa', 'guru'), reportsController.export);

module.exports = router;
