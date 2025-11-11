const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  getMyEnrolledCourses
} = require('../controllers/courseController');
const courseController = require('../controllers/courseController');

// Public routes
router.get('/', getAllCourses);

// Protected routes
router.get('/my/enrolled', auth, getMyEnrolledCourses);
router.get('/:id/progress', auth, courseController.getCourseProgress);
router.get('/:id', getCourseById);
router.post('/', auth, requireRole('instructor', 'admin'), createCourse);
router.post('/:id/structure/week', auth, requireRole('instructor', 'admin'), courseController.addWeek);
router.post('/:id/structure/week/:weekIndex/unit', auth, requireRole('instructor', 'admin'), courseController.addUnit);
router.post('/:id/structure/week/:weekIndex/unit/:unitIndex/lesson', auth, requireRole('instructor', 'admin'), courseController.addLesson);
router.post('/:id/progress/record', auth, courseController.recordProgress);
router.get('/:id/next', auth, courseController.getNextRecommendedLesson);
router.get('/:id/recommendations', auth, courseController.getSupplementaryRecommendations);

module.exports = router;