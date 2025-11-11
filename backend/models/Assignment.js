// backend/models/Assignment.js
const mongoose = require('mongoose');

const RubricCriterionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  maxPoints: { type: Number, required: true },
  description: String,
});

const AssignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, index: true },
    title: { type: String, required: true },
    description: String,
    formats: [String], // text, file, repo, presentation
    dueAt: Date,
    rubric: [RubricCriterionSchema],
    maxPoints: { type: Number, default: 100 },
    allowPeerReview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);


