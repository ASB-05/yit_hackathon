// backend/models/Progress.js
const mongoose = require('mongoose');

const LessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'mastered'],
    default: 'not_started',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: Date,
});

const ProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessons: [LessonProgressSchema],
    completionPercent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);


