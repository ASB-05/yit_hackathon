// backend/models/SpacedCard.js
const mongoose = require('mongoose');

const SpacedCardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    prompt: String,
    answer: String,
    dueAt: { type: Date, default: Date.now },
    interval: { type: Number, default: 1 }, // days
    easeFactor: { type: Number, default: 2.5 },
    repetitions: { type: Number, default: 0 },
    lastScore: { type: Number, default: 0 }, // 0-5
  },
  { timestamps: true }
);

SpacedCardSchema.index({ user: 1, course: 1, dueAt: 1 });

module.exports = mongoose.model('SpacedCard', SpacedCardSchema);


