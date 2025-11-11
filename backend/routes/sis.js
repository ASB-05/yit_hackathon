const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/sisController');

router.post('/sync/users', auth, c.syncUsers);
router.post('/sync/courses', auth, c.syncCourses);

module.exports = router;


