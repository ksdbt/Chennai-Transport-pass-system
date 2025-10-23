const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {auth} = require("../middlewares/auth");

// Middleware: check role
function checkRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

// ✅ Get all users – only Admin
router.get("/", auth, async (req, res) => {
try {
if (req.user.role !== "Admin") {
return res.status(403).json({ message: "Access denied" });
}

const users = await User.find().select("-password");
res.json(users);


} catch (err) {
console.error("Error fetching users:", err);
res.status(500).json({ message: "Server error" });
}
});

// // ================== GET ALL USERS (Admin + Manager) ==================
// router.get("/", auth, checkRole(["Admin", "TransportManager"]), async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ================== GET SINGLE USER (Admin + Manager + Self) ==================
// router.get("/:id", auth, async (req, res) => {
//   try {
//     // allow self OR admin/manager
//     if (req.user.id !== req.params.id && !["Admin", "TransportManager"].includes(req.user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// ================== UPDATE USER ROLE (Admin only) ==================
router.put("/:id/role", auth, checkRole(["Admin"]), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["Passenger", "TransportManager", "Admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: `Role updated to ${role}`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================== DELETE USER (Admin only) ==================
router.delete("/:id", auth, checkRole(["Admin"]), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
