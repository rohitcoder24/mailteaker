const gmailService = require('../services/gmailService');

// const connect = (req, res, next) => {
//   try {
//     const authUrl = gmailService.getAuthUrl(req.user.id);
//     res.json({ success: true, data: { authUrl } });
//   } catch (error) {
//     next(error);
//   }
// };
const connect = (req, res, next) => {
  try {
    //console.log("User:", req.user);

    const authUrl = gmailService.getAuthUrl(req.user.id);

    //console.log("Auth URL:", authUrl);

    res.json({
      success: true,
      data: {
        authUrl,
      },
    });
  } catch (error) {
    //console.error(error);
    next(error);
  }
};
const callback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect('/dashboard?gmail=error&message=missing_code');
    }

    await gmailService.handleCallback(code, Number(state));
    res.redirect('/dashboard?gmail=connected');
  } catch (error) {
    next(error);
  }
};

module.exports = { connect, callback };
