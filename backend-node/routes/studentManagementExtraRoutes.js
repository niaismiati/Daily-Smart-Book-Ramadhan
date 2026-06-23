const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const studentManagementExtraController = require('../controllers/studentManagementExtraController');

// GRUP 1 (missing endpoints untuk frontend)
router.post('/students/:id/reset-password', checkRole('guru'), studentManagementExtraController.resetStudentPassword);
router.post('/students/import', checkRole('guru'), studentManagementExtraController.importStudents);
router.get('/students/export', checkRole('guru'), studentManagementExtraController.exportStudents);

module.exports = router;

