const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },   // ✅ changed from "name"
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  role: {
    type: String,
    enum: ["Passenger", "TransportManager", "Admin"],
    default: "Passenger",
  },
  resetToken: String,
resetTokenExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
