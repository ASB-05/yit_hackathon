// backend/models/Gradebook.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true }, // sum to 1 per course
  items: [{
    refType: { type: String, enum: ['assignment', 'quiz', 'exam'], required: true },
    refId: mongoose.Schema.Types.ObjectId,
    maxPoints: Number,
  }],
});

const CurveSchema = new mongoose.Schema({
  method: { type: String, enum: ['none', 'linear', 'gaussian'], default: 'none' },
  params: {},
});

const GradebookSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
    categories: [CategorySchema],
    curve: CurveSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gradebook', GradebookSchema);


