const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/parentController');

router.post('/link', auth, requireRole('admin', 'instructor'), c.linkParent);
router.get('/:studentId/course/:courseId/progress', auth, requireRole('parent', 'admin', 'instructor'), c.getStudentProgress);

module.exports = router;


