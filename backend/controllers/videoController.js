// backend/controllers/videoController.js
const Content = require('../models/Content');
const VideoQuiz = require('../models/VideoQuiz');
const QuizAttempt = require('../models/QuizAttempt');
const Note = require('../models/Note');
const AnalyticsEvent = require('../models/AnalyticsEvent');

// GET /api/video/:contentId
exports.getVideo = async (req, res) => {
  try {
    const content = await Content.findById(req.params.contentId);
    if (!content) return res.status(404).json({ msg: 'Content not found' });
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/video/:contentId/quiz
exports.getVideoQuiz = async (req, res) => {
  try {
    const quiz = await VideoQuiz.findOne({ content: req.params.contentId });
    if (!quiz) return res.json({ questions: [] });
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/video/:contentId/quiz/answer
exports.submitVideoQuizAnswer = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { questionId, selectedChoiceId, courseId, videoQuizId } = req.body;
    const quiz = await VideoQuiz.findById(videoQuizId);
    if (!quiz || String(quiz.content) !== String(contentId)) {
      return res.status(400).json({ msg: 'Invalid quiz reference' });
    }
    const q = quiz.questions.id(questionId);
    if (!q) return res.status(404).json({ msg: 'Question not found' });

    const isCorrect = q.correctChoiceId === selectedChoiceId;
    const pointsAwarded = isCorrect ? q.points || 1 : 0;

    let attempt = await QuizAttempt.findOne({
      user: req.user.id,
      content: contentId,
      videoQuiz: videoQuizId,
    });
    if (!attempt) {
      attempt = new QuizAttempt({
        user: req.user.id,
        course: courseId,
        content: contentId,
        videoQuiz: videoQuizId,
        answers: [],
        totalPoints: 0,
      });
    }
    attempt.answers.push({ questionId, selectedChoiceId, isCorrect, pointsAwarded });
    attempt.totalPoints += pointsAwarded;
    await attempt.save();

    res.json({ isCorrect, pointsAwarded, totalPoints: attempt.totalPoints });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/video/:contentId/note
exports.addNote = async (req, res) => {
  try {
    const { content, timestampSeconds, lessonId, courseId } = req.body;
    const note = new Note({
      user: req.user.id,
      course: courseId,
      lessonId,
      content,
      timestampSeconds,
    });
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/video/notes/:lessonId
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id, lessonId: req.params.lessonId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/video/:contentId/event
exports.trackEvent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { courseId, lessonId, type, payload } = req.body;
    const ev = new AnalyticsEvent({
      user: req.user.id,
      course: courseId,
      lessonId,
      type,
      payload: { contentId, ...payload },
    });
    await ev.save();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


