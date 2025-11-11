const CaptionTrack = require('../models/CaptionTrack');

exports.addCaptionTrack = async (req, res) => {
  try {
    const { content, language, url, label } = req.body;
    const ct = new CaptionTrack({ content, language, url, label });
    await ct.save();
    res.json(ct);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.listCaptionTracks = async (req, res) => {
  try {
    const { contentId } = req.params;
    const tracks = await CaptionTrack.find({ content: contentId });
    res.json(tracks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


