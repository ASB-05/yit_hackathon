const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/calendarController');

router.post('/', auth, c.createEvent);
router.get('/course/:courseId', auth, c.listEvents);

module.exports = router;


