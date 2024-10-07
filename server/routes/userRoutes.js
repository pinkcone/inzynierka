const express = require('express');
const router = express.Router();

const { loginUser, registerUser, createUser, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/add-user', authMiddleware, createUser); 
router.put('/update-user/:id', authMiddleware, updateUser); 

module.exports = router;
