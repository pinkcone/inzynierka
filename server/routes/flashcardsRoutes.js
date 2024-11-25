const express = require('express');
const router = express.Router();
const { getFlashcardsBySet, 
    createFlashcardsForSet, 
    updateFlashcardByUserRate, 
    getUserFlashcardSets, 
    deleteFlashcardsBySet,
    resetFlashcardsBySet } = require('../controllers/flashcardsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-from-set/:setId', authMiddleware, createFlashcardsForSet);
router.get('/set/:setId', authMiddleware, getFlashcardsBySet);
router.put('/update/:flashcardId', authMiddleware, updateFlashcardByUserRate);
router.get('/sets', authMiddleware, getUserFlashcardSets);
router.delete('/set/:setId', authMiddleware, deleteFlashcardsBySet);
router.put('/set/:setId/reset', authMiddleware, resetFlashcardsBySet);
module.exports = router;