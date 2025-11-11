const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const AdaptiveProfile = require('../models/AdaptiveProfile');
const adaptiveService = require('../services/adaptiveService');

// @route   GET api/courses
// @desc    Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.instructor) {
      filter.instructor = req.query.instructor;
    }
    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', ['name'])
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Course.countDocuments(filter),
    ]);
    res.json({
      data: courses,
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

// @route   GET api/courses/:id
// @desc    Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', ['name']);
      
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
  const { title, description, structure, settings } = req.body;
  try {
    // Check user role (assuming authMiddleware adds user to req)
    const user = req.user;
    if (user.role !== 'instructor' && user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const newCourse = new Course({
      title,
      description,
      structure,
      settings,
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const total = user.enrolledCourses.length;
    const start = (page - 1) * limit;
    const data = user.enrolledCourses.slice(start, start + limit);
    res.json({
      data,
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

// @route   POST api/courses/:id/structure/week
// @desc    Add a new week to a course (Instructor/Admin)
exports.addWeek = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'instructor' && user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    const { title, order } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    course.structure.push({ title, order, units: [] });
    await course.save();
    res.json(course.structure);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/courses/:id/structure/week/:weekIndex/unit
// @desc    Add a new unit to a week (Instructor/Admin)
exports.addUnit = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'instructor' && user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    const { title } = req.body;
    const { id, weekIndex } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    if (!course.structure[weekIndex]) {
      return res.status(400).json({ msg: 'Invalid week index' });
    }
    course.structure[weekIndex].units.push({ title, lessons: [] });
    await course.save();
    res.json(course.structure[weekIndex]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/courses/:id/structure/week/:weekIndex/unit/:unitIndex/lesson
// @desc    Add a new lesson to a unit (Instructor/Admin)
exports.addLesson = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== 'instructor' && user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    const { title, type, contentRef, body, prerequisites, branching, estimatedMinutes, skills } = req.body;
    const { id, weekIndex, unitIndex } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const week = course.structure[weekIndex];
    if (!week) return res.status(400).json({ msg: 'Invalid week index' });
    const unit = week.units[unitIndex];
    if (!unit) return res.status(400).json({ msg: 'Invalid unit index' });
    unit.lessons.push({ title, type, contentRef, body, prerequisites, branching, estimatedMinutes, skills });
    await course.save();
    res.json(unit.lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/courses/:id/progress/record
// @desc    Record progress for a lesson (Authenticated)
exports.recordProgress = async (req, res) => {
  try {
    const { lessonId, status, score, timeSpentSeconds } = req.body;
    const { id } = req.params;

    let progress = await Progress.findOne({ user: req.user.id, course: id });
    if (!progress) {
      progress = new Progress({ user: req.user.id, course: id, lessons: [] });
    }
    const existing = progress.lessons.find((lp) => String(lp.lessonId) === String(lessonId));
    if (existing) {
      existing.status = status ?? existing.status;
      if (typeof score === 'number') existing.score = score;
      if (typeof timeSpentSeconds === 'number') existing.timeSpentSeconds = (existing.timeSpentSeconds || 0) + timeSpentSeconds;
      existing.lastAccessedAt = new Date();
    } else {
      progress.lessons.push({
        lessonId,
        status: status || 'in_progress',
        score,
        timeSpentSeconds: timeSpentSeconds || 0,
        lastAccessedAt: new Date(),
      });
    }
    // recompute completion percent
    const total = progress.lessons.length || 1;
    const completed = progress.lessons.filter((l) => l.status === 'completed' || l.status === 'mastered').length;
    progress.completionPercent = Math.round((completed / total) * 100);
    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/courses/:id/progress
// @desc    Get progress for a course (Authenticated)
exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id, course: req.params.id });
    if (!progress) {
      return res.json({ completionPercent: 0, lessons: [] });
    }
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/courses/:id/next
// @desc    Get next recommended lesson (Authenticated, simple heuristic placeholder)
exports.getNextRecommendedLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const progress = await Progress.findOne({ user: req.user.id, course: id });
    const profile = await AdaptiveProfile.findOne({ user: req.user.id });

    const nextLesson = adaptiveService.getNextLesson({ course, progress, profile });
    if (!nextLesson) return res.json({ msg: 'All lessons completed' });
    res.json({ lessonId: nextLesson._id, title: nextLesson.title, type: nextLesson.type });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/courses/:id/recommendations
// @desc    Get supplementary material recommendations (Authenticated)
exports.getSupplementaryRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    const progress = await Progress.findOne({ user: req.user.id, course: id });
    const profile = await AdaptiveProfile.findOne({ user: req.user.id });
    const items = adaptiveService.getSupplementaryMaterials({ course, progress, profile, limit: 5 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};