const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTestManual, createTestRandom, getTestInformation, getTestQuestion, getAllTests } = require('../controllers/testController');

router.put('/create-manual', authMiddleware, createTestManual);
router.put('/create-random', authMiddleware, createTestRandom);
router.put('/get-all-tests', authMiddleware, getAllTests);
router.put('/get-information', authMiddleware, getTestInformation);
router.put('/get-questions', authMiddleware, getTestQuestion);
module.exports = router;