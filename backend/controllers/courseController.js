const Course = require('../models/Course');
const User = require('../models/User');

// @route   GET api/courses
// @desc    Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', ['name']);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/courses/:id
// @desc    Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', ['name'])
      .populate('lessons');
      
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/courses
// @desc    Create a new course (Instructor/Admin only)
exports.createCourse = async (req, res) => {
  const { title, description, lessons } = req.body;
  try {
    // Check user role (assuming authMiddleware adds user to req)
    const user = await User.findById(req.user.id);
    if (user.role !== 'instructor' && user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const newCourse = new Course({
      title,
      description,
      lessons,
      instructor: req.user.id,
    });

    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/courses/my-courses
// @desc    Get courses for the logged-in student
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'instructor',
        select: 'name'
      }
    });
    
    if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.enrolledCourses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};