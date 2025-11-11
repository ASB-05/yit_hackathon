// backend/models/Gamification.js
const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    iconUrl: String,
    criteria: {}, // flexible rules
  },
  { timestamps: true }
);

const UserBadgeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    badgeKey: { type: String, required: true, index: true },
    awardedAt: { type: Date, default: Date.now },
    reason: String,
  },
  { timestamps: true }
);

const CertificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    issuedAt: { type: Date, default: Date.now },
    certificateNumber: { type: String, required: true, unique: true },
    metadata: {},
  },
  { timestamps: true }
);

module.exports = {
  Badge: mongoose.model('Badge', BadgeSchema),
  UserBadge: mongoose.model('UserBadge', UserBadgeSchema),
  Certificate: mongoose.model('Certificate', CertificateSchema),
};


