const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/resourcesController');

router.get('/search', auth, c.searchResources);

module.exports = router;


