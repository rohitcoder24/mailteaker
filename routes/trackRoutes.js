const express = require('express');
const trackController = require('../controllers/trackController');

const router = express.Router();

router.get('/:trackingId', trackController.trackOpen);

module.exports = router;
