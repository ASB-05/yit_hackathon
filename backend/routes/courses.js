const express = require('express');
const router = express.Router();
const auth = require('./middleware/authMiddleware');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  getMyEnrolledCourses
} = require('../controllers/courseController');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', auth, createCourse);
router.get('/my/enrolled', auth, getMyEnrolledCourses);

module.exports = router;