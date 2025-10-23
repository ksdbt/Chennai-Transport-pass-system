const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();  // To access the .env file
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboard");
// Import Routes
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const {auth} = require("./middlewares/auth");
const passRoutes = require("./routes/pass");
const paymentRoutes = require("./routes/payment");
const historyRoutes = require("./routes/history");
const transactionRoutes = require("./routes/transactions");
const adminRoutes = require("./routes/admin");
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",   // frontend URL
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Use the routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/pass", passRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/transactions", transactionRoutes);
app.use ("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.get("/dashboard", auth, (req, res) => {
  res.json(`Welcome to your Dashboard, user ${req.user.id}`);
});

// Example route to check connection
app.get("/", (req, res) => {
  res.send("Welcome to the Public Transport Pass System!");
});

app.use((req, res) => res.status(404).send("Not Found"));

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

