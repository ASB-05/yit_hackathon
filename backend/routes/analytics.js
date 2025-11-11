const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/analyticsController');

router.get('/course/:courseId/stats', auth, c.getCourseStats);
router.get('/course/:courseId/at-risk', auth, c.listAtRiskStudents);
router.post('/course/:courseId/alerts', auth, c.createInterventionAlerts);

module.exports = router;


