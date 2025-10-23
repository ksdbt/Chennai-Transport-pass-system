const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  mode: { type: String, required: true }, // Transport mode (Bus, Train, Metro, All-in-One)
  status: { type: String, default: "success" },
  pass: { type: mongoose.Schema.Types.ObjectId, ref: "Pass" }, // 🔑 link to pass
  passType: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
