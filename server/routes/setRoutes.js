const express = require('express');
const router = express.Router();
const { addSet, editSet, deleteSet, changeSetOwner, getAllUserSets, getSetById, getAllSetsWithOwner, forceDeleteSet } = require('../controllers/setController');
const authMiddleware = require('../middleware/authMiddleware');
const { getPublicSets } = require('../controllers/setController');

router.get('/allsets', authMiddleware, getAllSetsWithOwner);  

router.get('/public', getPublicSets);
router.get('/:id', authMiddleware, getSetById);

router.post('/add', authMiddleware, addSet);
router.put('/edit/:id', authMiddleware, editSet);
router.delete('/delete/:id', authMiddleware, deleteSet);
router.put('/change-owner', authMiddleware, changeSetOwner);
router.get('/', authMiddleware, getAllUserSets);
router.delete('/forcedelete/:id', authMiddleware, forceDeleteSet);  


module.exports = router;
