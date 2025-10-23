const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const Pass = require("../models/Pass");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Dashboard data by role
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === "Passenger") {
      // Return user's passes and transactions
      const passes = await Pass.find({ userId }).sort({ validTo: -1 });
      const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
      return res.json({ role, passes, transactions });
    }

    if (role === "TransportManager") {
      // For simplicity, return passes in the manager's region
      // You can add region info in User or Pass model as needed
      const passes = await Pass.find({ /* filter by manager's region */ }).sort({ validTo: -1 });
      return res.json({ role, passes });
    }

    if (role === "Admin") {
      // Return all users, passes, transactions counts
      const usersCount = await User.countDocuments();
      const passesCount = await Pass.countDocuments();
      const transactionsCount = await Transaction.countDocuments();
      return res.json({ role, usersCount, passesCount, transactionsCount });
    }

    return res.status(403).json({ message: "Unauthorized role" });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/admin - Comprehensive admin dashboard data
router.get("/admin", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch comprehensive statistics
    const [
      totalUsers,
      totalPasses,
      totalTransactions,
      todayTransactions,
      todayPasses,
      activePasses,
      recentUsers,
      recentTransactions,
      transportModeStats
    ] = await Promise.all([
      User.countDocuments(),
      Pass.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      Pass.countDocuments({ createdAt: { $gte: today } }),
      Pass.countDocuments({ validTo: { $gte: now } }),
      User.find().sort({ createdAt: -1 }).limit(4).populate('role'),
      Transaction.find().sort({ createdAt: -1 }).limit(4).populate('userId', 'username email'),
      Transaction.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: "$mode", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        { $sort: { revenue: -1 } },
        { $limit: 4 }
      ])
    ]);

    // Calculate revenue statistics
    const [
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { status: "success", createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { status: "success", createdAt: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { status: "success", createdAt: { $gte: monthAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    // Calculate average transaction value
    const avgTransactionValue = totalTransactions > 0 
      ? Math.round((totalRevenue[0]?.total || 0) / totalTransactions)
      : 0;

    res.json({
      stats: {
        totalUsers,
        totalPasses,
        totalTransactions,
        totalRevenue: totalRevenue[0]?.total || 0,
        activePasses,
        todayRevenue: todayRevenue[0]?.total || 0,
        todayPasses,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        averageTransactionValue: avgTransactionValue,
        systemHealth: "Excellent",
        topTransportModes: transportModeStats
      },
      recentUsers,
      recentTransactions
    });

  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/manager - Manager dashboard data
router.get("/manager", auth, async (req, res) => {
  try {
    if (req.user.role !== "TransportManager") {
      return res.status(403).json({ message: "Access denied. Manager only." });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all passes and transactions for manager view
    const [
      totalPasses,
      activePasses,
      todayPasses,
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      recentPasses,
      transportModeStats
    ] = await Promise.all([
      Pass.countDocuments(),
      Pass.countDocuments({ validTo: { $gte: now } }),
      Pass.countDocuments({ createdAt: { $gte: today } }),
      Transaction.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { status: "success", createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { status: "success", createdAt: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: { status: "success", createdAt: { $gte: monthAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Pass.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'username email'),
      Transaction.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: "$mode", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
        { $sort: { revenue: -1 } }
      ])
    ]);

    const avgPassValue = totalPasses > 0 
      ? Math.round((totalRevenue[0]?.total || 0) / totalPasses)
      : 0;

    res.json({
      stats: {
        totalPasses,
        activePasses,
        todayPasses,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        averagePassValue: avgPassValue,
        topRoutes: transportModeStats
      },
      recentPasses
    });

  } catch (err) {
    console.error("Manager dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/admin-summary
router.get("/admin-summary", auth, async (req, res) => {
try {
if (req.user.role !== "Admin") {
return res.status(403).json({ message: "Unauthorized" });
}

const [userCount, passCount, transactions] = await Promise.all([
  User.countDocuments(),
  Pass.countDocuments(),
  Transaction.find({ status: "success" }),
]);

const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

res.json({
  totalUsers: userCount,
  totalPasses: passCount,
  totalRevenue,
});


} catch (err) {
console.error("Error fetching admin summary:", err);
res.status(500).json({ message: "Server error" });
}
});

module.exports = router;
