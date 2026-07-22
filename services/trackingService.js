const { Email, EmailOpen } = require('../models');

const recordOpen = async ({ trackingId, ipAddress, userAgent, referer }) => {
  console.log("========== TRACKING SERVICE ==========");
  console.log("Tracking ID:", trackingId);

  const email = await Email.findOne({
    where: { tracking_id: trackingId },
  });

  if (!email) {
    console.log("❌ Email not found for tracking ID");
    return null;
  }

  console.log("✅ Email Found:", email.id);

  const now = new Date();

  const [openRecord, created] = await EmailOpen.findOrCreate({
    where: {
      email_id: email.id,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    },
    defaults: {
      email_id: email.id,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      referer: referer || null,
      opened_at: now,
      open_count: 1,
    },
  });

  if (created) {
    console.log("✅ First Open Recorded");
  } else {
    console.log("✅ Existing Open Record Found");

    await openRecord.update({
      open_count: openRecord.open_count + 1,
      opened_at: now,
      referer: referer || openRecord.referer,
    });

    console.log("✅ Open Count Updated:", openRecord.open_count + 1);
  }

  return email;
};

module.exports = {
  recordOpen,
};