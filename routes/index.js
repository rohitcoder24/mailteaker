const express = require('express');
const authRoutes = require('./authRoutes');
const googleRoutes = require('./googleRoutes');
const emailRoutes = require('./emailRoutes');
const trackRoutes = require('./trackRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/google', googleRoutes);
router.use('/email', emailRoutes);
router.use('/track', trackRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Mail Tracking System is running' });
});

module.exports = router;
