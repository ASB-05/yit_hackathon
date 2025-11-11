// backend/models/CourseTemplate.js
const mongoose = require('mongoose');

const CourseTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    structure: {}, // weeks/units/lessons skeleton
    defaultSettings: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseTemplate', CourseTemplateSchema);


