// backend/models/Forum.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  isAnswer: { type: Boolean, default: false }, // expert/accepted answer
  createdAt: { type: Date, default: Date.now },
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
});

const ThreadSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, index: true },
    title: { type: String, required: true },
    posts: [PostSchema],
    tags: [String],
  },
  { timestamps: true }
);

ThreadSchema.index({ course: 1, updatedAt: -1 });

module.exports = mongoose.model('Thread', ThreadSchema);


