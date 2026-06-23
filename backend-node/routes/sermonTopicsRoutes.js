const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/auth');
const sermonTopicsController = require('../controllers/sermonTopicsController');

// GET /api/sermon-topics/active
router.get('/active', sermonTopicsController.getActiveTopics);

// Guru CRUD
router.get('/teacher', checkRole('guru'), sermonTopicsController.getAllTopics);
router.post('/teacher', checkRole('guru'), sermonTopicsController.createTopic);
router.put('/teacher/:id', checkRole('guru'), sermonTopicsController.updateTopic);
router.delete('/teacher/:id', checkRole('guru'), sermonTopicsController.deleteTopic);

module.exports = router;

