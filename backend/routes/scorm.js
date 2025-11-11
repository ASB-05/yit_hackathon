const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/scormController');

router.post('/package', auth, c.createPackage);
router.post('/:packageId/initialize', auth, c.initialize);
router.post('/:packageId/setvalue', auth, c.setValue);
router.post('/:packageId/commit', auth, c.commit);
router.post('/:packageId/finish', auth, c.finish);

module.exports = router;


