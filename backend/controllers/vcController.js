exports.createMeeting = async (req, res) => {
  try {
    const { title, startsAt, endsAt } = req.body;
    // stubbed meeting link
    const joinUrl = `https://example-vc.local/meet/${Date.now()}`;
    res.json({ title, startsAt, endsAt, joinUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


