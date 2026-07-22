const emailService = require('../services/emailService');

const sendEmail = async (req, res, next) => {
  try {
    const email = await emailService.sendTrackedEmail({
      userId: req.user.id,
      recipient: req.body.recipient,
      subject: req.body.subject,
      body: req.body.body,
    });

    res.status(201).json({
      success: true,
      data: {
        id: email.id,
        trackingId: email.tracking_id,
        recipient: email.recipient,
        subject: email.subject,
        status: email.status,
        sentAt: email.sent_at,
        
      },
    });
  } catch (error) {
    next(error);
  }
};

const listEmails = async (req, res, next) => {
  try {
    const emails = await emailService.listEmails(req.user.id);
    res.json({ success: true, data: emails });
  } catch (error) {
    next(error);
  }
};

const getEmail = async (req, res, next) => {
  try {
    const email = await emailService.getEmailById(req.user.id, req.params.id);
    res.json({ success: true, data: email });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendEmail, listEmails, getEmail };
