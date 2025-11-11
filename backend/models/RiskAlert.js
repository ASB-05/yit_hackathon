// backend/models/RiskAlert.js
const mongoose = require('mongoose');

const RiskAlertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    type: { type: String, enum: ['low_score', 'low_progress', 'inactivity'], required: true },
    level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    message: String,
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RiskAlert', RiskAlertSchema);


