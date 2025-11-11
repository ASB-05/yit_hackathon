const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const c = require('../controllers/templateController');

router.post('/', auth, requireRole('admin', 'instructor'), c.createTemplate);
router.post('/:templateId/instantiate', auth, requireRole('instructor', 'admin'), c.instantiateTemplate);

module.exports = router;


