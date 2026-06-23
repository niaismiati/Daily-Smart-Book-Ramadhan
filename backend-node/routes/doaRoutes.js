const express = require('express');
const router = express.Router();
const doaController = require('../controllers/doaController');
const { authorize } = require('../middleware/auth');

router.get('/', doaController.index);
router.post('/', authorize('guru'), doaController.store);
router.put('/:id', authorize('guru'), doaController.update);
router.delete('/:id', authorize('guru'), doaController.destroy);

module.exports = router;
