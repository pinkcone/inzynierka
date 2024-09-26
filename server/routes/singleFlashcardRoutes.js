const express = require('express');
const router = express.Router();
const { updateLearningState, getLearningState } = require('../controllers/singleFlashcardController');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/update/:flashcardId', authMiddleware, updateLearningState);


router.get('/set/:flashcardId', authMiddleware, getLearningState);

module.exports = router;
