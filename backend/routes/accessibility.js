const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/accessibilityController');

router.post('/captions', auth, c.addCaptionTrack);
router.get('/captions/:contentId', auth, c.listCaptionTracks);

module.exports = router;


