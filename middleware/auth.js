const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authenticate = (req, res, next) => {
  //console.log("=================================");
  //console.log("URL:", req.originalUrl);
  //console.log("Method:", req.method);
  //console.log("Authorization Header:", req.headers.authorization);
  //console.log("=================================");

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //console.log("Authenticated User:", decoded);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    //console.error("JWT Error:", err.message);
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = { authenticate };