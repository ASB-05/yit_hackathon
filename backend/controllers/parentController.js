const ParentLink = require('../models/ParentLink');
const Progress = require('../models/Progress');

exports.linkParent = async (req, res) => {
  try {
    const { parentId, studentId } = req.body;
    const link = new ParentLink({ parent: parentId, student: studentId });
    await link.save();
    res.json(link);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const link = await ParentLink.findOne({ parent: req.user.id, student: studentId });
    if (!link) return res.status(403).json({ msg: 'Not authorized' });
    const progress = await Progress.findOne({ user: studentId, course: courseId });
    res.json(progress || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


