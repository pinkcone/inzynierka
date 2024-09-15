const express = require('express');
const router = express.Router();
const { loginUser, registerUser, createUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/add-user', authMiddleware, createUser);
router.post('/register', registerUser);

module.exports = router;