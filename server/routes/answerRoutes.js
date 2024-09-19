const express = require('express');
const router = express.Router();
const { addAnswer, editAnswer, deleteAnswer, getAnswersByQuestionId, getAnswerById } = require('../controllers/answerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addAnswer);
router.put('/edit/:id', authMiddleware, editAnswer);
router.delete('/delete/:id', authMiddleware, deleteAnswer);
router.get('/question/:questionId', authMiddleware, getAnswersByQuestionId);
router.get('/:id', authMiddleware, getAnswerById);
module.exports = router;
