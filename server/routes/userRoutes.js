const express = require('express');
const router = express.Router();

const { loginUser, registerUser, createUser, updateUser, getAllUsers,updateUserRole, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/add-user', authMiddleware, createUser); 
router.put('/update-user/:id', authMiddleware, updateUser); 
router.get('/admin/users', authMiddleware, getAllUsers); 
router.put('/admin/update-role/:id', authMiddleware, updateUserRole); 
router.delete('/admin/delete-user/:id', authMiddleware, deleteUser);


module.exports = router;
