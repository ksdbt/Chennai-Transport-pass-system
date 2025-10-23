const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Authentication middleware
const auth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ message: "No token provided" });

  try {
    const accessToken = authHeader.split(" ")[1]; // "Bearer <token>"
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Attach full user (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // e.g. { _id, username, role, email, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Role-based access middleware
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
};

module.exports = { auth, checkRole };
