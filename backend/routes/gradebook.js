const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/gradebookController');

router.get('/:courseId', auth, requireRole('instructor', 'admin'), c.getGradebook);
router.post('/:courseId', auth, requireRole('instructor', 'admin'), c.upsertGradebook);

module.exports = router;


