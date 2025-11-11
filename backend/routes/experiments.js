const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/experimentController');

router.post('/', auth, c.createExperiment);
router.post('/:key/assign', auth, c.assignVariant);

module.exports = router;


