const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createCompletedTest, getCompletedTest, getAllCompletedTestsForTest} = require('../controllers/completedTestController');

router.post('/create', authMiddleware, createCompletedTest);
router.get('/get-test/:id', authMiddleware, getCompletedTest);
router.get('/history/:testCode', authMiddleware, getAllCompletedTestsForTest);
module.exports = router;