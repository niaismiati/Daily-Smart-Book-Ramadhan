const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { checkRole, allowSelfOrRole } = require('../middleware/auth');

router.get('/student/:userId', checkRole('siswa', 'guru'), allowSelfOrRole('userId', 'guru'), dashboardController.student);
router.get('/teacher', checkRole('guru'), dashboardController.teacher);

module.exports = router;
