/* eslint-disable no-console */
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Course = require('../models/Course');
const Content = require('../models/Content');
const VideoQuiz = require('../models/VideoQuiz');
const Assignment = require('../models/Assignment');
const Gradebook = require('../models/Gradebook');
const CalendarEvent = require('../models/CalendarEvent');
const Progress = require('../models/Progress');

async function run() {
  await connectDB();

  console.log('Seeding database...');

  // Clean minimal collections
  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@demo.com', 'instructor@demo.com', 'student@demo.com', 'parent@demo.com'] } }),
  ]);

  // Users
  const bcrypt = require('bcryptjs');
  const hash = async (pwd) => bcrypt.hash(pwd, await bcrypt.genSalt(10));
  const admin = new User({ name: 'Admin', email: 'admin@demo.com', password: await hash('admin123'), role: 'admin' });
  const instructor = new User({ name: 'Instructor One', email: 'instructor@demo.com', password: await hash('instructor123'), role: 'instructor' });
  const student = new User({ name: 'Student One', email: 'student@demo.com', password: await hash('student123'), role: 'student' });
  const parent = new User({ name: 'Parent One', email: 'parent@demo.com', password: await hash('parent123'), role: 'parent' });
  await admin.save(); await instructor.save(); await student.save(); await parent.save();

  // Content + video quiz
  const videoContent = new Content({
    title: 'What is Programming?',
    description: 'Introduction to programming concepts.',
    sources: [
      { type: 'video', url: 'https://cdn.demo/video1.mp4', durationSeconds: 930, thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
    ],
  });
  await videoContent.save();

  const vq = new VideoQuiz({
    content: videoContent._id,
    questions: [
      {
        timeOffsetSeconds: 120,
        question: 'Primary purpose of a programming language?',
        choices: [
          { id: 'a', text: 'Make computers faster' },
          { id: 'b', text: 'Communicate instructions to a computer' },
          { id: 'c', text: 'Design user interfaces' },
        ],
        correctChoiceId: 'b',
        points: 1,
        skillTags: ['fundamentals'],
      },
    ],
  });
  await vq.save();

  // Course with structure
  const course = new Course({
    title: 'Introduction to Computer Science',
    description: 'Foundations of computing and programming.',
    instructor: instructor._id,
    structure: [
      {
        title: 'Week 1: Fundamentals',
        order: 1,
        units: [
          {
            title: 'Introduction to Programming',
            lessons: [
              {
                title: 'What is Programming?',
                type: 'video',
                contentRef: videoContent._id,
                estimatedMinutes: 15,
                skills: ['fundamentals'],
              },
            ],
          },
        ],
      },
    ],
    settings: { masteryScore: 70, allowSkipping: false, scormCompliant: true },
  });
  await course.save();

  // Enroll student
  student.enrolledCourses = [course._id];
  await student.save();

  // Assignment
  const asg = new Assignment({
    course: course._id,
    title: 'Variables Practice Set',
    description: 'Exercises on variable declaration and data types.',
    formats: ['text', 'file'],
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    rubric: [
      { label: 'Correctness', maxPoints: 50 },
      { label: 'Completeness', maxPoints: 30 },
      { label: 'Style', maxPoints: 20 },
    ],
    maxPoints: 100,
    allowPeerReview: true,
  });
  await asg.save();

  // Gradebook
  const gb = new Gradebook({
    course: course._id,
    categories: [
      {
        name: 'Assignments',
        weight: 0.6,
        items: [{ refType: 'assignment', refId: asg._id, maxPoints: 100 }],
      },
      { name: 'Quizzes', weight: 0.4, items: [] },
    ],
    curve: { method: 'none', params: {} },
  });
  await gb.save();

  // Calendar event
  const ev = new CalendarEvent({
    course: course._id,
    title: 'Live Class: Intro Q&A',
    startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    kind: 'live_class',
    location: 'https://example-vc.local/meet/demo',
  });
  await ev.save();

  // Seed progress
  const prog = new Progress({
    user: student._id,
    course: course._id,
    lessons: [],
    completionPercent: 0,
  });
  await prog.save();

  console.log('Seed completed.');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


