const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/experimentController');

router.post('/', auth, requireRole('admin', 'instructor'), c.createExperiment);
router.post('/:key/assign', auth, c.assignVariant);

module.exports = router;


