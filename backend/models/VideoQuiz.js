// backend/models/VideoQuiz.js
const mongoose = require('mongoose');

const ChoiceSchema = new mongoose.Schema({
  id: String,
  text: String,
});

const QuestionSchema = new mongoose.Schema({
  timeOffsetSeconds: { type: Number, required: true }, // when to pause and ask
  question: { type: String, required: true },
  choices: [ChoiceSchema],
  correctChoiceId: { type: String, required: true },
  explanation: String,
  points: { type: Number, default: 1 },
  skillTags: [String],
});

const VideoQuizSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
      index: true,
    },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VideoQuiz', VideoQuizSchema);


