const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTestManual, createTestRandom, getTestInformation, getTestQuestion, getAllTests } = require('../controllers/testController');

router.put('/create-manual', authMiddleware, createTestManual);
router.put('/create-random', authMiddleware, createTestRandom);
router.get('/get-all-tests', authMiddleware, getAllTests);
router.get('/:code', authMiddleware, getTestInformation);
router.get('/:code/get-questions', authMiddleware, getTestQuestion);
module.exports = router;