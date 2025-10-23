const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");   // ✅ destructure properly
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const Pass = require("../models/Pass");
const Transaction = require("../models/Transaction");

// 🧪 TEST ENDPOINT - Verify payment system
router.get("/test", auth, async (req, res) => {
  try {
    res.json({
      message: "Payment system is working",
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({ message: "Test failed" });
  }
});

// 🧪 1. MOCK STRIPE SESSION
router.post("/create-session", auth, async (req, res) => {
  const { price } = req.body;

  if (!price || price <= 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  res.status(200).json({
    id: "mock_stripe_session_12345",
    message: "Mock Stripe session created"
  });
});

// 💳 2. RECORD MOCK PAYMENT
router.post("/mock", async (req, res) => {
  try {
    const { userId, method, amount } = req.body;

    const newTx = new Transaction({
      user: userId,
      method,
      amount,
      status: "success",
      date: new Date()
    });

    await newTx.save();
    res.json({ message: "Mock payment recorded", transaction: newTx });
  } catch (err) {
    console.error("Mock payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🚌 3. BUY PASS (after mock payment)
router.post("/buy-pass", auth, async (req, res) => {
  const {
    amount,
    mode,
    startLocation,
    endLocation,
    validFrom,
    validTill,
    passType,
    method
  } = req.body;

  console.log("🔍 Payment request received:", {
    user: req.user.id,
    amount,
    mode,
    startLocation,
    endLocation,
    validFrom,
    validTill,
    passType,
    method
  });

  if (!amount || !mode || !validFrom || !validTill || !passType) {
    console.log("❌ Missing required fields:", { amount, mode, validFrom, validTill, passType });
    return res.status(400).json({ message: "Missing required pass details" });
  }

  try {
    // Generate QR code
    const qrText = `PassID: ${uuidv4()} | User: ${req.user.id} | Mode: ${mode} | From: ${startLocation || "Any"} | To: ${endLocation || "Any"} | Type: ${passType} | Valid: ${validFrom} to ${validTill}`;
    console.log("📱 Generated QR Text:", qrText);

    const qrCode = await QRCode.toDataURL(qrText);
    console.log("✅ QR Code generated successfully");

    // Save transaction first
    console.log("💰 Creating transaction...");
    const transaction = new Transaction({
      transactionId: uuidv4(),
      userId: req.user.id,
      amount,
      method: method || "MockPayment",
      status: "success",
      mode,
      passType,
      date: new Date()
    });

    const savedTransaction = await transaction.save();
    console.log("✅ Transaction saved:", savedTransaction._id);

    // Save pass
    console.log("🎫 Creating pass...");
    const newPass = new Pass({
      userId: req.user.id,
      mode,
      startLocation: startLocation || "All Zones",
      endLocation: endLocation || "All Zones",
      validFrom: new Date(validFrom),
      validTo: new Date(validTill),
      qrCode,
      passType,
      amount
    });

    const savedPass = await newPass.save();
    console.log("✅ Pass saved:", savedPass._id);

    // Update transaction with pass reference
    await Transaction.findByIdAndUpdate(savedTransaction._id, {
      pass: savedPass._id
    });

    console.log("🎉 Payment and pass creation completed successfully");

    res.status(201).json({
      message: "Pass purchased successfully",
      transaction: savedTransaction,
      pass: savedPass
    });
  } catch (error) {
    console.error("❌ Error in /buy-pass route:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      message: error.message || "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
