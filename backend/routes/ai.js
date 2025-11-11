const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/aiController');

router.post('/tutor/:courseId/message', auth, c.postMessage);
router.get('/tutor/thread/:threadId', auth, c.getThread);
router.post('/srs/:courseId/seed', auth, c.seedCardsFromCourse);
router.get('/srs/:courseId/due', auth, c.listDueCards);
router.post('/srs/card/:cardId/review', auth, c.reviewCard);

module.exports = router;


