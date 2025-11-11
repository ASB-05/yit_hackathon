const express = require('express');
const router = express.Router();
const auth = require('./middleware/authMiddleware');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  getMyEnrolledCourses
} = require('../controllers/courseController');
const courseController = require('../controllers/courseController');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', auth, createCourse);
router.get('/my/enrolled', auth, getMyEnrolledCourses);
router.post('/:id/structure/week', auth, courseController.addWeek);
router.post('/:id/structure/week/:weekIndex/unit', auth, courseController.addUnit);
router.post('/:id/structure/week/:weekIndex/unit/:unitIndex/lesson', auth, courseController.addLesson);
router.post('/:id/progress/record', auth, courseController.recordProgress);
router.get('/:id/next', auth, courseController.getNextRecommendedLesson);
router.get('/:id/recommendations', auth, courseController.getSupplementaryRecommendations);

module.exports = router;