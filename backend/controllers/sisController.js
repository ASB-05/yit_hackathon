exports.syncUsers = async (req, res) => {
  try {
    // stub for SIS user sync
    res.json({ syncedUsers: 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.syncCourses = async (req, res) => {
  try {
    // stub for SIS courses sync
    res.json({ syncedCourses: 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


