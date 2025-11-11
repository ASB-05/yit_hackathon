const Thread = require('../models/Forum');

exports.createThread = async (req, res) => {
  try {
    const { course, lessonId, title, body, tags } = req.body;
    const t = new Thread({
      course,
      lessonId,
      title,
      posts: [{ author: req.user.id, body }],
      tags,
    });
    await t.save();
    res.json(t);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.replyToThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { body } = req.body;
    const t = await Thread.findById(threadId);
    if (!t) return res.status(404).json({ msg: 'Thread not found' });
    t.posts.push({ author: req.user.id, body });
    await t.save();
    res.json(t);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.markExpertAnswer = async (req, res) => {
  try {
    const { threadId, postIndex } = req.params;
    const t = await Thread.findById(threadId);
    if (!t || !t.posts[postIndex]) return res.status(404).json({ msg: 'Post not found' });
    t.posts[postIndex].isAnswer = true;
    await t.save();
    res.json(t);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.listThreads = async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { course: courseId };
    const [threads, total] = await Promise.all([
      Thread.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Thread.countDocuments(filter),
    ]);
    res.json({
      data: threads,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


