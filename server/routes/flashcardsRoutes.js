const express = require('express');
const router = express.Router();
const { getFlashcardsBySet, createFlashcardsForSet, updateFlashcardByUserRate } = require('../controllers/flashcardsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-from-set/:setId', authMiddleware, createFlashcardsForSet);
router.get('/set/:setId', authMiddleware, getFlashcardsBySet);
router.put('/update/:flashcardId', authMiddleware, updateFlashcardByUserRate);

module.exports = router;
