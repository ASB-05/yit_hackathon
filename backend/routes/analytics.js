const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/analyticsController');

router.get('/course/:courseId/stats', auth, requireRole('instructor', 'admin'), c.getCourseStats);
router.get('/course/:courseId/at-risk', auth, requireRole('instructor', 'admin'), c.listAtRiskStudents);
router.post('/course/:courseId/alerts', auth, requireRole('instructor', 'admin'), c.createInterventionAlerts);

module.exports = router;


