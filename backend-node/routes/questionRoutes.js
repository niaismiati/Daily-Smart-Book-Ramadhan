const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { checkRole } = require('../middleware/auth');

router.put('/:id', checkRole('guru'), quizController.updateQuestion);
router.delete('/:id', checkRole('guru'), quizController.deleteQuestion);

module.exports = router;
