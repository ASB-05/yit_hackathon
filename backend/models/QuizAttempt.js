// backend/models/QuizAttempt.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.ObjectId,
  selectedChoiceId: String,
  isCorrect: Boolean,
  pointsAwarded: Number,
  answeredAt: { type: Date, default: Date.now },
});

const QuizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
    videoQuiz: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoQuiz', required: true },
    answers: [AnswerSchema],
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);


