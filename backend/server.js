// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('./middleware/rateLimit');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/video', require('./routes/video'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/gradebook', require('./routes/gradebook'));
app.use('/api/forums', require('./routes/forums'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/offline', require('./routes/offline'));
app.use('/api/accessibility', require('./routes/accessibility'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/experiments', require('./routes/experiments'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/vc', require('./routes/vc'));
app.use('/api/scorm', require('./routes/scorm'));
app.use('/api/sis', require('./routes/sis'));
// Add other routes here (e.g., for users)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));