const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { checkRole, allowSelfOrRole } = require('../middleware/auth');

router.get('/', quizController.index);
router.post('/', checkRole('guru'), quizController.store);
router.get('/history/:userId', allowSelfOrRole('userId', 'guru'), quizController.history);
router.post('/hasil', checkRole('siswa', 'guru'), quizController.submitResult);
router.get('/:id/questions', checkRole('siswa', 'guru'), quizController.questions);
router.post('/:id/questions', checkRole('guru'), quizController.storeQuestion);
router.post('/:id/start', checkRole('siswa'), quizController.start);
router.post('/:id/submit', checkRole('siswa'), quizController.submit);
router.get('/:id/results', checkRole('guru'), quizController.results);
router.put('/:id', checkRole('guru'), quizController.update);
router.delete('/:id', checkRole('guru'), quizController.destroy);

module.exports = router;
