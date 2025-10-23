// clear.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Pass = require("./models/Pass");
const Transaction = require("./models/Transaction");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    await Pass.deleteMany({});
    await Transaction.deleteMany({});
    console.log("✅ All data deleted successfully.");
    process.exit();
  } catch (err) {
    console.error("❌ Failed to delete:", err.message);
    process.exit(1);
  }
})();
