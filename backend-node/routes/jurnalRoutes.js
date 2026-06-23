const express = require('express');
const router = express.Router();
const jurnalController = require('../controllers/jurnalController');
const { checkRole, allowSelfOrRole } = require('../middleware/auth');

router.get('/', checkRole('guru'), jurnalController.getAll);
router.get('/:userId', allowSelfOrRole('userId', 'guru'), jurnalController.getByUser);
router.post('/', checkRole('siswa', 'guru'), jurnalController.store);
router.put('/:id', checkRole('siswa', 'guru'), jurnalController.update);
router.delete('/:id', checkRole('siswa', 'guru'), jurnalController.destroy);
router.post('/:id/comment', checkRole('guru'), jurnalController.comment);

module.exports = router;
