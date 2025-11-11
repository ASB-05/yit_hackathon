// backend/models/Course.js
const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // video, text, quiz, assignment, scorm
  contentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  },
  body: String, // optional inline content (markdown, text)
  prerequisites: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    requiredScore: Number, // for mastery-based progression
  }],
  branching: [{
    condition: {
      type: String, // e.g., "score<70", "timeSpent>300"
    },
    nextLessonId: mongoose.Schema.Types.ObjectId,
  }],
  estimatedMinutes: Number,
  skills: [String],
});

const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema],
});

const WeekSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  units: [UnitSchema],
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
  structure: [WeekSchema],
  enrollments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  settings: {
    masteryScore: { type: Number, default: 70 },
    allowSkipping: { type: Boolean, default: false },
    scormCompliant: { type: Boolean, default: true },
  },
}, { timestamps: true });

CourseSchema.index({ instructor: 1 });
CourseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', CourseSchema);