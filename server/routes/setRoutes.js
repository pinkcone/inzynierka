const express = require('express');
const router = express.Router();
const { addSet, editSet, deleteSet, changeSetOwner, getAllUserSets } = require('../controllers/setController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addSet);
router.put('/edit/:id', authMiddleware, editSet);
router.delete('/delete/:id', authMiddleware, deleteSet);
router.put('/change-owner', authMiddleware, changeSetOwner);
router.get('/', authMiddleware, getAllUserSets);

router.get('/:id', authMiddleware, getSetById);

module.exports = router;
