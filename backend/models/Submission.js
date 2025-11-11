// backend/models/Submission.js
const mongoose = require('mongoose');

const ArtifactSchema = new mongoose.Schema({
  type: String, // file, url, text, repo
  url: String,
  text: String,
  filename: String,
  sizeBytes: Number,
});

const ReviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scores: [{ criterion: String, points: Number, comment: String }],
  overallComment: String,
  createdAt: { type: Date, default: Date.now },
});

const SubmissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    artifacts: [ArtifactSchema],
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviews: [ReviewSchema], // peer reviews
    plagiarismScore: { type: Number, default: 0 }, // 0-100 (stub)
    status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignment: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);


