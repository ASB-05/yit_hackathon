const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/calendarController');

router.post('/', auth, requireRole('instructor', 'admin'), c.createEvent);
router.get('/course/:courseId', auth, c.listEvents);

module.exports = router;


