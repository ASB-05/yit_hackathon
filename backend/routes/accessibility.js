const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/accessibilityController');

router.post('/captions', auth, requireRole('instructor', 'admin'), c.addCaptionTrack);
router.get('/captions/:contentId', auth, c.listCaptionTracks);

module.exports = router;


