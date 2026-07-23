const trackingService = require("../services/trackingService");
const { TRANSPARENT_PIXEL_BUFFER } = require("../utils/transparentPixel");

const trackOpen = async (req, res) => {
  console.log("========== TRACK HIT ==========");

  const userAgent = req.headers["user-agent"] || "";
  const ua = userAgent.toLowerCase();

  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    null;

  console.log("Tracking ID:", req.params.trackingId);
  console.log("User-Agent:", userAgent);
  console.log("IP:", ipAddress);

  // Ignore Gmail / Google Image Proxy requests
  if (
    ua.includes("googleimageproxy") ||
    ua.includes("googleusercontent") ||
    ua.includes("google-proxy")
  ) {
    console.log("⚠ Google Image Proxy detected. Open ignored.");

    res.set({
      "Content-Type": "image/png",
      "Content-Length": TRANSPARENT_PIXEL_BUFFER.length,
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    });

    return res.status(200).send(TRANSPARENT_PIXEL_BUFFER);
  }

  try {
    const result = await trackingService.recordOpen({
      trackingId: req.params.trackingId,
      ipAddress,
      userAgent,
      referer: req.headers.referer || null,
    });

    console.log(
      "Tracking Result:",
      result ? "OPEN RECORDED" : "EMAIL NOT FOUND"
    );
  } catch (error) {
    console.error("Tracking Error:", error.message);
  }

  res.set({
    "Content-Type": "image/png",
    "Content-Length": TRANSPARENT_PIXEL_BUFFER.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, private",
    Pragma: "no-cache",
    Expires: "0",
  });

  return res.status(200).send(TRANSPARENT_PIXEL_BUFFER);
};

module.exports = { trackOpen };
