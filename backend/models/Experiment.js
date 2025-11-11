// backend/models/Experiment.js
const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  key: String,
  weight: Number, // 0..1 ratio
});

const AssignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  variantKey: String,
});

const ExperimentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
    description: String,
    variants: [VariantSchema],
    assignments: [AssignmentSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experiment', ExperimentSchema);


