// backend/models/Content.js
const mongoose = require('mongoose');

const MediaSourceSchema = new mongoose.Schema({
  type: {
    type: String, // video, pdf, ppt, scorm, simulation
    required: true,
  },
  url: String,
  durationSeconds: Number,
  sizeBytes: Number,
  captionsUrl: String,
  thumbnailUrl: String,
});

const ContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    sources: [MediaSourceSchema],
    metadata: {
      // arbitrary metadata per type
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', ContentSchema);


