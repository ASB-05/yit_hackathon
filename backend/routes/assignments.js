const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/assignmentController');

router.post('/', auth, c.createAssignment);
router.get('/course/:courseId', auth, c.listAssignments);
router.post('/:assignmentId/submit', auth, c.submitAssignment);
router.post('/submission/:submissionId/review', auth, c.addPeerReview);
router.post('/submission/:submissionId/grade', auth, c.gradeSubmission);
router.post('/submission/:submissionId/plagiarism', auth, c.runPlagiarismCheck);

module.exports = router;


