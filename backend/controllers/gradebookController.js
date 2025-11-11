const Gradebook = require('../models/Gradebook');

exports.upsertGradebook = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { categories, curve } = req.body;
    let gb = await Gradebook.findOne({ course: courseId });
    if (!gb) {
      gb = new Gradebook({ course: courseId, categories, curve });
    } else {
      gb.categories = categories ?? gb.categories;
      gb.curve = curve ?? gb.curve;
    }
    await gb.save();
    res.json(gb);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getGradebook = async (req, res) => {
  try {
    const gb = await Gradebook.findOne({ course: req.params.courseId });
    res.json(gb || {});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


