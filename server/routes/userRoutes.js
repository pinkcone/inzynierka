const express = require('express');
const router = express.Router();

const { loginUser, registerUser,  updateUser, getAllUsers,updateUserRole, deleteUser, changeActive } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');


router.post('/login', loginUser);
router.post('/register', registerUser);
router.put('/update-user/:id', authMiddleware, updateUser); 
router.get('/admin/users', authMiddleware, adminAuthMiddleware, getAllUsers); 
router.put('/admin/update-role/:id', authMiddleware, adminAuthMiddleware, updateUserRole); 
router.delete('/admin/delete-user/:id', authMiddleware, adminAuthMiddleware, deleteUser);
router.patch('/admin/update-active/:id', authMiddleware, adminAuthMiddleware, changeActive);

module.exports = router;
