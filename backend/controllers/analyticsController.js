const Progress = require('../models/Progress');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const RiskAlert = require('../models/RiskAlert');

exports.getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await Progress.find({ course: courseId });
    const totalStudents = progress.length;
    const avgCompletion =
      totalStudents === 0
        ? 0
        : Math.round(progress.reduce((sum, p) => sum + (p.completionPercent || 0), 0) / totalStudents);
    res.json({ totalStudents, avgCompletion });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.listAtRiskStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await Progress.find({ course: courseId });
    const cutoffCompletion = 40;
    const cutoffDaysInactive = 7;
    const now = Date.now();

    const events = await AnalyticsEvent.find({ course: courseId }).sort({ createdAt: -1 });
    const lastEventByUser = new Map();
    for (const e of events) {
      if (!lastEventByUser.has(String(e.user))) lastEventByUser.set(String(e.user), e.createdAt);
    }

    const atRisk = [];
    for (const p of progress) {
      const lastSeen = lastEventByUser.get(String(p.user));
      const days = lastSeen ? (now - new Date(lastSeen).getTime()) / (1000 * 60 * 60 * 24) : Infinity;
      if ((p.completionPercent || 0) < cutoffCompletion || days > cutoffDaysInactive) {
        atRisk.push({
          user: p.user,
          completionPercent: p.completionPercent || 0,
          daysInactive: Math.floor(days),
        });
      }
    }
    res.json({ atRisk });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createInterventionAlerts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { items } = req.body; // [{user, type, level, message}]
    const created = [];
    for (const it of items || []) {
      const alert = new RiskAlert({ course: courseId, user: it.user, type: it.type, level: it.level, message: it.message });
      await alert.save();
      created.push(alert);
    }
    res.json(created);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


