const { v4: uuidv4 } = require('uuid');
const { Email, EmailOpen } = require('../models');
const gmailService = require('./gmailService');
const AppError = require('../utils/AppError');

const TRACKING_PIXEL_TAG = (trackingUrl) =>
  `<img src="${trackingUrl}" width="1" height="1" alt="" style="display:none;border:0;outline:none;" />`;

const injectTrackingPixel = (htmlBody, trackingId) => {
  const trackingUrl = `${process.env.APP_URL}/track/${trackingId}`;
  const pixel = TRACKING_PIXEL_TAG(trackingUrl);

  if (/<\/body>/i.test(htmlBody)) {
    return htmlBody.replace(/<\/body>/i, `${pixel}</body>`);
  }

  return `${htmlBody}${pixel}`;
};

const sendTrackedEmail = async ({ userId, recipient, subject, body }) => {
  const trackingId = uuidv4();
  const htmlWithPixel = injectTrackingPixel(body, trackingId);

  const emailRecord = await Email.create({
    user_id: userId,
    tracking_id: trackingId,
    recipient,
    subject,
    body,
    status: 'pending',
  });

  try {
    const gmailResponse = await gmailService.sendEmail({
      userId,
      to: recipient,
      subject,
      htmlBody: htmlWithPixel,
    });

    await emailRecord.update({
      status: 'sent',
      sent_at: new Date(),
      gmail_message_id: gmailResponse.id,
      gmail_thread_id: gmailResponse.threadId,
    });
  } catch (error) {
    await emailRecord.update({ status: 'failed' });
    throw new AppError(`Failed to send email: ${error.message}`, 502);
  }

  return emailRecord;
};

const listEmails = async (userId) => {
  const emails = await Email.findAll({
    where: { user_id: userId },
    include: [{ model: EmailOpen, as: 'opens' }],
    order: [['sent_at', 'DESC'], ['createdAt', 'DESC']],
  });

  return emails.map(formatEmailSummary);
};

const getEmailById = async (userId, emailId) => {
  const email = await Email.findOne({
    where: { id: emailId, user_id: userId },
    include: [{ model: EmailOpen, as: 'opens' }],
  });

  if (!email) {
    throw new AppError('Email not found', 404);
  }

  return formatEmailDetail(email);
};

const formatEmailSummary = (email) => {
  const opens = email.opens || [];
  const totalOpens = opens.reduce((sum, open) => sum + open.open_count, 0);
  const lastOpen = opens.length
    ? opens.reduce((latest, open) =>
        !latest || new Date(open.opened_at) > new Date(latest.opened_at) ? open : latest
      , null)
    : null;

  return {
    id: email.id,
    recipient: email.recipient,
    subject: email.subject,
    sentTime: email.sent_at,
    openStatus: totalOpens > 0 ? 'opened' : 'not_opened',
    openCount: totalOpens,
    lastOpenTime: lastOpen ? lastOpen.opened_at : null,
    status: email.status,
  };
};

const formatEmailDetail = (email) => {
  const summary = formatEmailSummary(email);

  return {
    ...summary,
    trackingId: email.tracking_id,
    body: email.body,
    gmailMessageId: email.gmail_message_id,
    opens: (email.opens || []).map((open) => ({
      id: open.id,
      ipAddress: open.ip_address,
      userAgent: open.user_agent,
      referer: open.referer,
      openedAt: open.opened_at,
      openCount: open.open_count,
    })),
  };
};

module.exports = {
  sendTrackedEmail,
  listEmails,
  getEmailById,
  injectTrackingPixel,
};
