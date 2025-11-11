const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/offlineController');

router.get('/manifest/:courseId', auth, c.getOfflineManifest);

module.exports = router;


