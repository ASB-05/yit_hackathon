// backend/models/CaptionTrack.js
const mongoose = require('mongoose');

const CaptionTrackSchema = new mongoose.Schema(
  {
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
    language: { type: String, required: true }, // e.g., en, es
    url: { type: String, required: true },
    label: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaptionTrack', CaptionTrackSchema);


