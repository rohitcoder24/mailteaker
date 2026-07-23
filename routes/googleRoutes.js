const express = require('express');
const googleController = require('../controllers/googleController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/connect', authenticate, googleController.connect);
router.get('/callback', googleController.callback);

module.exports = router;
