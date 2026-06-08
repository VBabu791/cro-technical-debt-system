const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/assessmentController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
