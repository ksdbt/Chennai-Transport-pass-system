const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Pass = require("../models/Pass");
const Transaction = require("../models/Transaction");
const { auth } = require("../middlewares/auth");

// Middleware: only Admin can access
function checkAdmin(req, res, next) {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}

router.get("/stats", auth, checkAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPasses = await Pass.countDocuments();
    const totalRevenueAgg = await Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    res.json({ totalUsers, totalPasses, totalRevenue });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
