const CalendarEvent = require('../models/CalendarEvent');

exports.createEvent = async (req, res) => {
  try {
    const { course, title, startsAt, endsAt, kind, location, metadata } = req.body;
    const ev = new CalendarEvent({ course, title, startsAt, endsAt, kind, location, metadata });
    await ev.save();
    res.json(ev);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.listEvents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const events = await CalendarEvent.find({ course: courseId }).sort({ startsAt: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


