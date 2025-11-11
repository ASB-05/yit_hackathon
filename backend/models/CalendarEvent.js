// backend/models/CalendarEvent.js
const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    kind: { type: String, enum: ['deadline', 'live_class', 'exam', 'other'], default: 'other' },
    location: String, // or VC URL
    metadata: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);


