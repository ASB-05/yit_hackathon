const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/gamificationController');

router.post('/badges', auth, c.createBadge);
router.post('/award/:userId', auth, c.awardBadge);
router.post('/certificate/:userId', auth, c.issueCertificate);

module.exports = router;


