// backend/models/Scorm.js
const mongoose = require('mongoose');

const ScormPackageSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: String,
    manifestUrl: String,
    launchUrl: String,
    metadata: {},
  },
  { timestamps: true }
);

const ScormRuntimeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scormPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'ScormPackage', required: true, index: true },
    cmi: {}, // store CMI data
    sessionOpen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  ScormPackage: mongoose.model('ScormPackage', ScormPackageSchema),
  ScormRuntime: mongoose.model('ScormRuntime', ScormRuntimeSchema),
};


