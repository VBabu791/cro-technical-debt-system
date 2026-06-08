const express = require('express');
const router = express.Router();
const { getAll, create } = require('../controllers/leadsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', getAll);
router.post('/', create);

module.exports = router;
