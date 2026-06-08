const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser } = require('../controllers/usersController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
