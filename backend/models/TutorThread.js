// backend/models/TutorThread.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TutorThreadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('TutorThread', TutorThreadSchema);


