const express = require('express');
const router = express.Router();
const prayerScheduleController = require('../controllers/prayerScheduleController');
const { authorize } = require('../middleware/auth');

router.get('/', prayerScheduleController.index);
router.post('/', authorize('guru'), prayerScheduleController.store);

module.exports = router;
