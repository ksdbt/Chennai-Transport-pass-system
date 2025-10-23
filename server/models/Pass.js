const mongoose = require("mongoose");

const passSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mode: {
    type: String,
    enum: ["Bus", "Train", "Metro", "All-in-One"],
    required: true
  },
  startLocation: String,
  endLocation: String,
  qrCode: String,
  validFrom: Date,
  validTo: Date,
  passType: {
    type: String,
    enum: ["One Day", "Weekly", "Monthly"],
    required: true
  },
  amount: { type: Number, required: true }, // Add this line to store the price
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Pass", passSchema);
