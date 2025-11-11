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
    const list = await Thread.find({ course: courseId }).sort({ updatedAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


