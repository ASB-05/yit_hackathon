const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

exports.createAssignment = async (req, res) => {
  try {
    const { course, lessonId, title, description, formats, dueAt, rubric, maxPoints, allowPeerReview } = req.body;
    const a = new Assignment({ course, lessonId, title, description, formats, dueAt, rubric, maxPoints, allowPeerReview });
    await a.save();
    res.json(a);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.listAssignments = async (req, res) => {
  try {
    const list = await Assignment.find({ course: req.params.courseId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { artifacts } = req.body;
    const s = new Submission({ assignment: assignmentId, user: req.user.id, artifacts });
    await s.save();
    res.json(s);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addPeerReview = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { scores, overallComment } = req.body;
    const s = await Submission.findById(submissionId);
    if (!s) return res.status(404).json({ msg: 'Submission not found' });
    s.reviews.push({ reviewer: req.user.id, scores, overallComment });
    await s.save();
    res.json(s);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade } = req.body;
    const s = await Submission.findById(submissionId);
    if (!s) return res.status(404).json({ msg: 'Submission not found' });
    s.grade = grade;
    s.gradedBy = req.user.id;
    s.status = 'graded';
    await s.save();
    res.json(s);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Stub plagiarism check (integration point)
exports.runPlagiarismCheck = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const s = await Submission.findById(submissionId);
    if (!s) return res.status(404).json({ msg: 'Submission not found' });
    // simulate external score
    s.plagiarismScore = Math.floor(Math.random() * 21); // 0-20%
    await s.save();
    res.json({ plagiarismScore: s.plagiarismScore });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


