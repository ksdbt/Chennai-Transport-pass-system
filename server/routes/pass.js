const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const Pass = require("../models/Pass");
const { auth, checkRole } = require("../middlewares/auth");

// GET /api/passes - Get passes based on user role
router.get("/", auth, async (req, res) => {
  try {
    const { role } = req.user;
    const { passType, status, dateFrom, dateTo } = req.query;

    // Build filter object
    let filter = {};
    
    // Role-based filtering
    if (role === "Passenger") {
      filter.userId = req.user.id;
    }
    // Admin and Manager can see all passes

    // Apply additional filters
    if (passType) filter.mode = passType;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    // Status filtering
    if (status) {
      const now = new Date();
      if (status === "Active") {
        filter.validTo = { $gte: now };
      } else if (status === "Expired") {
        filter.validTo = { $lt: now };
      }
    }

    const passes = await Pass.find(filter)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({ passes });
  } catch (err) {
    console.error("❌ Error fetching passes:", err.message);
    res.status(500).json({ message: "Error fetching passes" });
  }
});

// GET /api/passes/stats - Get pass statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const { role } = req.user;
    let filter = {};
    
    if (role === "Passenger") {
      filter.userId = req.user.id;
    }

    const now = new Date();
    const [
      totalPasses,
      activePasses,
      expiredPasses,
      totalRevenue
    ] = await Promise.all([
      Pass.countDocuments(filter),
      Pass.countDocuments({ ...filter, validTo: { $gte: now } }),
      Pass.countDocuments({ ...filter, validTo: { $lt: now } }),
      Pass.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    res.json({
      totalPasses,
      activePasses,
      expiredPasses,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (err) {
    console.error("❌ Error fetching pass stats:", err.message);
    res.status(500).json({ message: "Error fetching pass statistics" });
  }
});

// POST /api/pass/buy
router.post("/buy", auth, async (req, res) => {
  const { mode, startLocation, endLocation, passType } = req.body;

  if (!mode || !startLocation || !endLocation || !passType)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const validFrom = new Date();
    const validTo = new Date();
    validTo.setDate(validFrom.getDate() + 30); // valid for 30 days

    // Initialize price to 0
    let price = 0;

    // Price logic for different modes
    if (mode === "All-in-One") {
      if (passType === "One Day") price = 100;
      if (passType === "Weekly") price = 400;
      if (passType === "Monthly") price = 1000;
    } else {
      // Assuming base fare logic for bus, train, metro
      const baseFare = 10;

      // Distance calculation logic
      // This is a simple example assuming the startLocation and endLocation are array indices
      // Replace this with proper logic if using real coordinates or more accurate locations
      const allLocations = {
        Bus: ["T Nagar", "Guindy", "Tambaram", "Velachery"],
        Train: ["Chennai Central", "Egmore", "Tambaram", "Mambalam"],
        Metro: ["Airport", "Ashok Nagar", "Guindy", "Washermanpet"]
      };

      const startIdx = allLocations[mode].indexOf(startLocation);
      const endIdx = allLocations[mode].indexOf(endLocation);
      const distance = Math.abs(startIdx - endIdx); // Calculate distance between start and end locations

      price = baseFare * distance; // Price is multiplied by distance

      if (passType === "Weekly") price *= 5;
      if (passType === "Monthly") price *= 20;
    }

    // Add the calculated price to the pass data
    const passData = {
      userId: req.user.id,
      mode,
      startLocation,
      endLocation,
      validFrom,
      validTo,
      passType,
      amount: price, // Add price to pass data
    };

    // Generate QR code with price included
    const qrText = `Pass for ${req.user.id}, Mode: ${mode}, From: ${startLocation}, To: ${endLocation}, ValidTill: ${validTo}, Price: ₹${price}`;
    const qrCode = await QRCode.toDataURL(qrText);
    passData.qrCode = qrCode;

    // Save the pass data into the database
    const newPass = new Pass(passData);
    await newPass.save();

    // Respond with the created pass and a success message
    res.status(201).json({ message: "Pass created", pass: newPass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating pass" });
  }
});

// Example protected route for Admin only
router.post("/admin-only", auth, checkRole("Admin"), (req, res) => {
  res.json({ message: "✅ Only admins can see this" });
});

// GET /api/passes/top-routes - Top performing routes by users
router.get("/top-routes", auth, async (req, res) => {
  try {
    const { role } = req.user;

    // Only allow Admin or TransportManager to see this
    if (!["Admin", "TransportManager"].includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Aggregate passes by userId and sum amount and count
    const topRoutes = await Pass.aggregate([
      {
        $group: {
          _id: "$userId",
          totalAmount: { $sum: "$amount" },
          passCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }, // Sort by totalAmount descending
      { $limit: 5 } // Show top 5 users
    ]);

    // Populate the user info for each aggregated result
    const populatedResults = await User.populate(topRoutes, {
      path: "_id",
      select: "username email"
    });

    res.json({ topRoutes: populatedResults });
  } catch (error) {
    console.error("❌ Error fetching top routes:", error.message);
    res.status(500).json({ message: "Error fetching top routes" });
  }
});

// GET /api/passes/top-routes - Top performing routes by start & end locations
router.get("/top-routes", auth, async (req, res) => {
  try {
    const { role } = req.user;

    if (!["Admin", "TransportManager"].includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const topRoutes = await Pass.aggregate([
      {
        $group: {
          _id: { startLocation: "$startLocation", endLocation: "$endLocation" },
          totalAmount: { $sum: "$amount" },
          passCount: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 }
    ]);

    res.json({ topRoutes });
  } catch (error) {
    console.error("❌ Error fetching top routes:", error.message);
    res.status(500).json({ message: "Error fetching top routes" });
  }
});


module.exports = router;
