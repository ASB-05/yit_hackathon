const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/sisController');

router.post('/sync/users', auth, requireRole('admin'), c.syncUsers);
router.post('/sync/courses', auth, requireRole('admin'), c.syncCourses);

module.exports = router;


