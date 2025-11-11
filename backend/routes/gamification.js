const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/gamificationController');

router.post('/badges', auth, requireRole('admin'), c.createBadge);
router.post('/award/:userId', auth, requireRole('instructor', 'admin'), c.awardBadge);
router.post('/certificate/:userId', auth, requireRole('instructor', 'admin'), c.issueCertificate);

module.exports = router;


