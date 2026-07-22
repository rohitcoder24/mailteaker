// const trackingService = require('../services/trackingService');
// const { TRANSPARENT_PIXEL_BUFFER } = require('../utils/transparentPixel');

// const trackOpen = async (req, res) => {
//   const ipAddress =
//     req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
//     req.socket.remoteAddress ||
//     null;

//   try {
//     await trackingService.recordOpen({
//       trackingId: req.params.trackingId,
//       ipAddress,
//       userAgent: req.headers['user-agent'] || null,
//       referer: req.headers.referer || null,
//     });
//   } catch (error) {
//     if (process.env.NODE_ENV !== 'production') {
//       //console.error('Tracking error:', error.message);
//     }
//   }

//   res.set({
//     'Content-Type': 'image/png',
//     'Content-Length': TRANSPARENT_PIXEL_BUFFER.length,
//     'Cache-Control': 'no-store, no-cache, must-revalidate, private',
//     Pragma: 'no-cache',
//     Expires: '0',
//   });

//   res.status(200).send(TRANSPARENT_PIXEL_BUFFER);
// };

// module.exports = { trackOpen };
const trackingService = require('../services/trackingService');
const { TRANSPARENT_PIXEL_BUFFER } = require('../utils/transparentPixel');

const trackOpen = async (req, res) => {
  console.log("========== TRACK HIT ==========");
  console.log("Tracking ID:", req.params.trackingId);
  console.log("User-Agent:", req.headers["user-agent"]);
  console.log("IP:", req.headers["x-forwarded-for"] || req.socket.remoteAddress);

  const ipAddress =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    null;

  try {
    const result = await trackingService.recordOpen({
      trackingId: req.params.trackingId,
      ipAddress,
      userAgent: req.headers['user-agent'] || null,
      referer: req.headers.referer || null,
    });

    console.log("Tracking Result:", result ? "FOUND" : "EMAIL NOT FOUND");
  } catch (error) {
    console.error("Tracking Error:", error);
  }

  res.set({
    "Content-Type": "image/png",
    "Content-Length": TRANSPARENT_PIXEL_BUFFER.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });

  res.status(200).send(TRANSPARENT_PIXEL_BUFFER);
};

module.exports = { trackOpen };