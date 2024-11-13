const express = require('express');
const router = express.Router();
const {createReport, checkIfReported, getAllReports, updateReportStatus } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware'); 
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

router.post('/create', authMiddleware, createReport);
router.get('/check/:setId', authMiddleware, checkIfReported);
router.get('/reports', authMiddleware, adminAuthMiddleware, getAllReports);
router.patch('/admin/update-status/:reportId', authMiddleware, adminAuthMiddleware, updateReportStatus);

module.exports = router;
