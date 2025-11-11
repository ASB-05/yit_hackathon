const CourseTemplate = require('../models/CourseTemplate');
const Course = require('../models/Course');

exports.createTemplate = async (req, res) => {
  try {
    const { name, description, structure, defaultSettings } = req.body;
    const t = new CourseTemplate({ name, description, structure, defaultSettings });
    await t.save();
    res.json(t);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.instantiateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { title, description } = req.body;
    const tpl = await CourseTemplate.findById(templateId);
    if (!tpl) return res.status(404).json({ msg: 'Template not found' });
    const course = new Course({
      title,
      description,
      structure: tpl.structure,
      settings: tpl.defaultSettings,
      instructor: req.user.id,
    });
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


