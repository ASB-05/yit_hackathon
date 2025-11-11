const Content = require('../models/Content');
const CaptionTrack = require('../models/CaptionTrack');
const Course = require('../models/Course');

exports.getOfflineManifest = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const contentIds = [];
    for (const week of course.structure || []) {
      for (const unit of week.units || []) {
        for (const lesson of unit.lessons || []) {
          if (lesson.contentRef) contentIds.push(lesson.contentRef);
        }
      }
    }
    const contents = await Content.find({ _id: { $in: contentIds } });
    const captions = await CaptionTrack.find({ content: { $in: contentIds } });

    const items = [];
    for (const c of contents) {
      for (const s of c.sources || []) {
        items.push({
          url: s.url,
          sizeBytes: s.sizeBytes,
          type: s.type,
          checksum: undefined,
        });
      }
    }
    for (const cap of captions) {
      items.push({ url: cap.url, type: 'caption', sizeBytes: undefined });
    }

    res.json({ courseId, items });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


