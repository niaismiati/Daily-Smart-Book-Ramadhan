const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const { checkRole, allowSelfOrRole } = require('../middleware/auth');

router.get('/students', checkRole('guru'), managementController.students);
router.post('/students', checkRole('guru'), managementController.storeStudent);
router.put('/students/:id', checkRole('guru'), managementController.updateStudent);
router.delete('/students/:id', checkRole('guru'), managementController.deleteStudent);
router.get('/users', checkRole('guru'), managementController.users);
router.put('/users/:id', checkRole('guru'), managementController.updateUser);
router.get('/notifications/:userId', checkRole('siswa', 'guru'), allowSelfOrRole('userId', 'guru'), managementController.notifications);
router.post('/notifications', checkRole('guru'), managementController.storeNotification);
router.put('/notifications/:id/read', checkRole('siswa', 'guru'), managementController.readNotification);
router.get('/classes', checkRole('guru'), managementController.classes);

module.exports = router;
