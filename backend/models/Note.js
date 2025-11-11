// backend/models/Note.js
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    content: { type: String, required: true },
    // for videos: timestamp seconds; for text: section marker
    timestampSeconds: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', NoteSchema);


