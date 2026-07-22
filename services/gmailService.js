const { google } = require('googleapis');
const { GmailAccount } = require('../models');
const AppError = require('../utils/AppError');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
];

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

const getAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: String(userId),
  });
};

const handleCallback = async (code, userId) => {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    version: "v2",
    auth: oauth2Client,
  });

  const { data: profile } = await oauth2.userinfo.get();

  await GmailAccount.upsert({
    user_id: userId,
    gmail_email: profile.email,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });
};

const getAuthenticatedClient = async (userId) => {
  const account = await GmailAccount.findOne({
    where: { user_id: userId },
  });

  if (!account) {
    throw new AppError(
      "Gmail account not connected. Visit /google/connect first.",
      400
    );
  }

  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expiry_date,
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.access_token) {
      await account.update({
        access_token: tokens.access_token,
        expiry_date: tokens.expiry_date || account.expiry_date,
        ...(tokens.refresh_token
          ? { refresh_token: tokens.refresh_token }
          : {}),
      });
    }
  });

  return { oauth2Client, account };
};

const sendEmail = async ({ userId, to, subject, htmlBody }) => {
  const { oauth2Client } = await getAuthenticatedClient(userId);

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  const messageParts = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    htmlBody,
  ];

  // ================= DEBUG LOG =================

  console.log("\n================ EMAIL DEBUG ================\n");

  console.log("To:");
  console.log(to);

  console.log("\nSubject:");
  console.log(subject);

  console.log("\nHTML Body:");
  console.log(htmlBody);

  console.log("\nRaw Email:");
  console.log(messageParts.join("\n"));

  console.log("\nTracking Present:");
  console.log(htmlBody.includes("/track/"));

  const match = htmlBody.match(/src="([^"]+)"/);

  if (match) {
    console.log("\nTracking URL:");
    console.log(match[1]);
  } else {
    console.log("\nNo IMG tag found.");
  }

  console.log("\n=============================================\n");

  // ============================================

  const rawMessage = Buffer.from(messageParts.join("\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
    },
  });

  console.log("\n=========== GMAIL RESPONSE ===========");
  console.log(response.data);
  console.log("======================================\n");

  return response.data;
};

module.exports = {
  getAuthUrl,
  handleCallback,
  sendEmail,
  getAuthenticatedClient,
};