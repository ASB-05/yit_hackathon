// backend/models/AdaptiveProfile.js
const mongoose = require('mongoose');

const SkillMasterySchema = new mongoose.Schema({
  skillId: String, // map to learning outcomes/skills
  mastery: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  lastUpdatedAt: Date,
});

const AdaptiveProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferences: {
      pace: {
        type: String,
        enum: ['slow', 'normal', 'fast'],
        default: 'normal',
      },
      preferredContentTypes: [String],
    },
    skillMastery: [SkillMasterySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdaptiveProfile', AdaptiveProfileSchema);


