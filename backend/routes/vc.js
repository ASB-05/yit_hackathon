const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/vcController');

router.post('/meeting', auth, requireRole('instructor', 'admin'), c.createMeeting);

module.exports = router;


