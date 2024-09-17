const express = require('express');
const router = express.Router();
const { addQuestion, editQuestion, deleteQuestion, getQuestionsBySet } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addQuestion);
router.put('/edit/:id', authMiddleware, editQuestion);
router.delete('/delete/:id', authMiddleware, deleteQuestion);
router.get('/set/:setId', authMiddleware, getQuestionsBySet);
module.exports = router;