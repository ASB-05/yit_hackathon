const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/forumController');

router.post('/', auth, c.createThread);
router.get('/course/:courseId', auth, c.listThreads);
router.post('/:threadId/reply', auth, c.replyToThread);
router.post('/:threadId/answer/:postIndex', auth, c.markExpertAnswer);

module.exports = router;


