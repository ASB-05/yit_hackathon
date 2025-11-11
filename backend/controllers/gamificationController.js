const { Badge, UserBadge, Certificate } = require('../models/Gamification');

exports.createBadge = async (req, res) => {
  try {
    const { key, name, description, iconUrl, criteria } = req.body;
    const b = new Badge({ key, name, description, iconUrl, criteria });
    await b.save();
    res.json(b);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.awardBadge = async (req, res) => {
  try {
    const { userId } = req.params;
    const { badgeKey, reason } = req.body;
    const ub = new UserBadge({ user: userId, badgeKey, reason });
    await ub.save();
    res.json(ub);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.issueCertificate = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId, metadata } = req.body;
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cert = new Certificate({ user: userId, course: courseId, certificateNumber, metadata });
    await cert.save();
    res.json(cert);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


