const express = require('express');
const router = express.Router();
const { getFlashcardsBySet, createFlashcardsForSet } = require('../controllers/flashcardsController');
const authMiddleware = require('../middleware/authMiddleware');




router.post('/create-from-set/:setId', authMiddleware, createFlashcardsForSet);
router.get('/set/:setId', authMiddleware, getFlashcardsBySet);

module.exports = router;
