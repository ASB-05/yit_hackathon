const { ScormPackage, ScormRuntime } = require('../models/Scorm');

exports.createPackage = async (req, res) => {
  try {
    const { course, title, manifestUrl, launchUrl, metadata } = req.body;
    const p = new ScormPackage({ course, title, manifestUrl, launchUrl, metadata });
    await p.save();
    res.json(p);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.initialize = async (req, res) => {
  try {
    const { packageId } = req.params;
    let rt = await ScormRuntime.findOne({ user: req.user.id, scormPackage: packageId });
    if (!rt) {
      rt = new ScormRuntime({ user: req.user.id, scormPackage: packageId, cmi: {}, sessionOpen: true });
    } else {
      rt.sessionOpen = true;
    }
    await rt.save();
    res.json({ status: 'LMSInitialize', ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.setValue = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { key, value } = req.body;
    const rt = await ScormRuntime.findOne({ user: req.user.id, scormPackage: packageId });
    if (!rt || !rt.sessionOpen) return res.status(400).json({ msg: 'Session not initialized' });
    rt.cmi = rt.cmi || {};
    rt.cmi[key] = value;
    await rt.save();
    res.json({ status: 'LMSSetValue', ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.commit = async (req, res) => {
  try {
    res.json({ status: 'LMSCommit', ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.finish = async (req, res) => {
  try {
    const { packageId } = req.params;
    const rt = await ScormRuntime.findOne({ user: req.user.id, scormPackage: packageId });
    if (rt) {
      rt.sessionOpen = false;
      await rt.save();
    }
    res.json({ status: 'LMSFinish', ok: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


