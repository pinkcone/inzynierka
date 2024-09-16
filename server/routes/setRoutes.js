const express = require('express');
const router = express.Router();
const { addSet, editSet, deleteSet, changeSetOwner } = require('../controllers/setController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/add', authMiddleware, addSet);
router.put('/edit/:id', authMiddleware, editSet);
router.delete('/delete/:id', authMiddleware, deleteSet);
router.put('/change-owner', authMiddleware, changeSetOwner);

module.exports = router;
