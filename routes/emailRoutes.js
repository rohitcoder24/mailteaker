const express = require('express');
const emailController = require('../controllers/emailController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { sendEmailValidation } = require('../validators/authValidators');

const router = express.Router();

router.use(authenticate);

router.post('/send', sendEmailValidation, validate, emailController.sendEmail);
router.get('/', emailController.listEmails);
router.get('/:id', emailController.getEmail);

module.exports = router;
