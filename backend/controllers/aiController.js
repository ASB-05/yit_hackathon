const TutorThread = require('../models/TutorThread');
const SpacedCard = require('../models/SpacedCard');
const Course = require('../models/Course');

// Tutor chat (stubbed assistant response)
exports.postMessage = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, threadId, text } = req.body;
    let thread = threadId ? await TutorThread.findById(threadId) : null;
    if (!thread) {
      thread = new TutorThread({ user: req.user.id, course: courseId, lessonId, messages: [] });
    }
    thread.messages.push({ role: 'user', text });
    // simple stubbed assistant response
    const reply =
      'Thanks for your question. Consider revisiting the prerequisite lesson and trying the practice questions. Focus on key definitions and work through a small example.';
    thread.messages.push({ role: 'assistant', text: reply });
    await thread.save();
    res.json(thread);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getThread = async (req, res) => {
  try {
    const t = await TutorThread.findById(req.params.threadId);
    if (!t) return res.status(404).json({ msg: 'Thread not found' });
    res.json(t);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Spaced repetition (simple SM-2 like)
const updateCardWithScore = (card, q) => {
  let ease = card.easeFactor || 2.5;
  const quality = Math.max(0, Math.min(5, q));
  if (quality >= 3) {
    if (card.repetitions === 0) card.interval = 1;
    else if (card.repetitions === 1) card.interval = 6;
    else card.interval = Math.round(card.interval * ease);
    card.repetitions += 1;
  } else {
    card.repetitions = 0;
    card.interval = 1;
  }
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;
  card.easeFactor = ease;
  card.lastScore = quality;
  const next = new Date();
  next.setDate(next.getDate() + Math.max(1, card.interval));
  card.dueAt = next;
};

exports.seedCardsFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const created = [];
    for (const week of course.structure || []) {
      for (const unit of week.units || []) {
        for (const lesson of unit.lessons || []) {
          const prompt = `Key points from: ${lesson.title}`;
          const answer = 'Review lesson summary and key formulas/concepts.';
          const card = new SpacedCard({
            user: req.user.id,
            course: courseId,
            lessonId: lesson._id,
            prompt,
            answer,
          });
          await card.save();
          created.push(card);
        }
      }
    }
    res.json({ count: created.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.listDueCards = async (req, res) => {
  try {
    const { courseId } = req.params;
    const now = new Date();
    const cards = await SpacedCard.find({ user: req.user.id, course: courseId, dueAt: { $lte: now } }).sort({
      dueAt: 1,
    });
    res.json(cards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.reviewCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { quality } = req.body; // 0-5
    const card = await SpacedCard.findById(cardId);
    if (!card || String(card.user) !== String(req.user.id)) return res.status(404).json({ msg: 'Card not found' });
    updateCardWithScore(card, quality);
    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


