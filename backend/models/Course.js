// backend/models/Course.js
const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: String,
  type: String, // video, text, quiz, assignment
  content: String, // URL for video, or markdown for text
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lessons: [LessonSchema],
  enrollments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

module.exports = mongoose.model('Course', CourseSchema);