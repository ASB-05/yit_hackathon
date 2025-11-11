const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/templateController');

router.post('/', auth, c.createTemplate);
router.post('/:templateId/instantiate', auth, c.instantiateTemplate);

module.exports = router;


