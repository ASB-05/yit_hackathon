const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/parentController');

router.post('/link', auth, c.linkParent);
router.get('/:studentId/course/:courseId/progress', auth, c.getStudentProgress);

module.exports = router;


