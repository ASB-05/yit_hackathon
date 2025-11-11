const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/forumController');

router.post('/', auth, c.createThread);
router.get('/course/:courseId', auth, c.listThreads);
router.post('/:threadId/reply', auth, c.replyToThread);
router.post('/:threadId/answer/:postIndex', auth, requireRole('instructor', 'admin'), c.markExpertAnswer);

module.exports = router;


