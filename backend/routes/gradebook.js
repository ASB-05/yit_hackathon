const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/gradebookController');

router.get('/:courseId', auth, c.getGradebook);
router.post('/:courseId', auth, c.upsertGradebook);

module.exports = router;


