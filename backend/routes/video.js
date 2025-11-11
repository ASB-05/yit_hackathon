const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/videoController');

// public: fetch metadata can be public if content is public; keep it protected for now
router.get('/:contentId', auth, controller.getVideo);
router.get('/:contentId/quiz', auth, controller.getVideoQuiz);
router.post('/:contentId/quiz/answer', auth, controller.submitVideoQuizAnswer);
router.post('/:contentId/note', auth, controller.addNote);
router.get('/notes/:lessonId', auth, controller.getNotes);
router.post('/:contentId/event', auth, controller.trackEvent);

module.exports = router;


