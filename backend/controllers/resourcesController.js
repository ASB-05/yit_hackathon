exports.searchResources = async (req, res) => {
  try {
    const { query } = req.query;
    // stubbed external recommendations
    const items = [
      { title: ' Khan Academy - Related Topic', url: 'https://www.khanacademy.org/', provider: 'khan' },
      { title: ' Coursera - Suggested Course', url: 'https://www.coursera.org/', provider: 'coursera' },
      { title: ' Wikipedia Overview', url: 'https://www.wikipedia.org/', provider: 'wikipedia' },
    ].filter((x) => !query || x.title.toLowerCase().includes(String(query).toLowerCase()));
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


