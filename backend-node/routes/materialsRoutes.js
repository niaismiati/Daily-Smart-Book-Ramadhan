const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materialsController');
const { authorize } = require('../middleware/auth');

router.get('/readings', materialsController.myReadings);
router.get('/categories', materialsController.categories);
router.get('/', materialsController.index);
router.get('/:id', materialsController.show);
router.post('/', authorize('guru'), materialsController.store);
router.put('/:id', authorize('guru'), materialsController.update);
router.delete('/:id', authorize('guru'), materialsController.destroy);
router.post('/:id/read', materialsController.markRead);
router.post('/categories', authorize('guru'), materialsController.storeCategory);
router.delete('/categories/:id', authorize('guru'), materialsController.deleteCategory);

module.exports = router;
