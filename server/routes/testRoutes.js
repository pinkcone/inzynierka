const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createTestManual, createTestRandom } = require('../controllers/testController');

router.put('/create-manual', authMiddleware, createTestManual);
router.put('/create-random', authMiddleware, createTestRandom);

module.exports = router;