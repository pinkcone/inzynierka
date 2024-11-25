const express = require('express');
const router = express.Router();
const { addSet, editSet, deleteSet, changeSetOwner, getAllUserSets, getSetById, getAllSetsWithOwner, forceDeleteSet, addCollaborator } = require('../controllers/setController');
const authMiddleware = require('../middleware/authMiddleware');
const { getPublicSets } = require('../controllers/setController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');


router.get('/allsets', authMiddleware, adminAuthMiddleware, getAllSetsWithOwner);  

router.get('/public', getPublicSets);
router.get('/:id', authMiddleware, getSetById);
router.post('/add', authMiddleware, addSet);
router.put('/edit/:id', authMiddleware, editSet);
router.delete('/delete/:id', authMiddleware, deleteSet);
router.put('/change-owner', authMiddleware, changeSetOwner);
router.get('/', authMiddleware, getAllUserSets);
router.delete('/forcedelete/:id', authMiddleware, adminAuthMiddleware, forceDeleteSet);  
router.put('/add-collabolator/:setId', authMiddleware, addCollaborator);

module.exports = router;
