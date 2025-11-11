// backend/models/AnalyticsEvent.js
const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      required: true,
    }, // 'video.play', 'video.pause', 'quiz.submit', 'note.add', etc.
    payload: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);


