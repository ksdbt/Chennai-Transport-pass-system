const express = require("express");
const router = express.Router();
const {auth} = require("../middlewares/auth");
const Transaction = require("../models/Transaction");
const Pass = require("../models/Pass");

// GET /api/transactions - Get transactions based on user role
router.get("/", auth, async (req, res) => {
  try {
    const { role } = req.user;
    const { status, passType, dateFrom, dateTo, minAmount, maxAmount } = req.query;

    // Build filter object
    let filter = {};
    
    // Role-based filtering
    if (role === "Passenger") {
      filter.userId = req.user.id;
    }
    // Admin and Manager can see all transactions

    // Apply additional filters
    if (status) filter.status = status;
    if (passType) filter.mode = passType;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const transactions = await Transaction.find(filter)
      .populate('userId', 'username email')
      .populate('pass', 'passType mode')
      .sort({ createdAt: -1 });

    res.status(200).json({ transactions });
  } catch (err) {
    console.error("❌ Error fetching transactions:", err.message);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// GET /api/transactions/stats - Get transaction statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const { role } = req.user;
    let filter = {};
    
    if (role === "Passenger") {
      filter.userId = req.user.id;
    }

    const [
      totalTransactions,
      completedTransactions,
      totalRevenue,
      averageAmount
    ] = await Promise.all([
      Transaction.countDocuments(filter),
      Transaction.countDocuments({ ...filter, status: "success" }),
      Transaction.aggregate([
        { $match: { ...filter, status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Transaction.aggregate([
        { $match: filter },
        { $group: { _id: null, avg: { $avg: "$amount" } } }
      ])
    ]);

    res.json({
      totalTransactions,
      completedTransactions,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageAmount: Math.round(averageAmount[0]?.avg || 0)
    });
  } catch (err) {
    console.error("❌ Error fetching transaction stats:", err.message);
    res.status(500).json({ message: "Error fetching transaction statistics" });
  }
});

module.exports = router;
