const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/vcController');

router.post('/meeting', auth, c.createMeeting);

module.exports = router;


