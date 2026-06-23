const express = require('express');
const router = express.Router();
const fridayPrayerController = require('../controllers/fridayPrayerController');
const { authorize } = require('../middleware/auth');

router.get('/', fridayPrayerController.index);
router.post('/', fridayPrayerController.store);
router.put('/:id', authorize('guru'), fridayPrayerController.grade);
router.delete('/:id', authorize('guru'), fridayPrayerController.destroy);

module.exports = router;
