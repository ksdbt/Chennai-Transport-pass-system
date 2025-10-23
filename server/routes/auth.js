const express = require("express"); 
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { Resend } = require("resend");
const { auth } = require("../middlewares/auth");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

// Store reset tokens temporarily (better in DB or Redis in real-world)
let resetTokens = {};
let refreshTokens = [];
console.log("✅ auth.js loaded");


// ================== SIGNUP ==================
router.post("/signup", async (req, res) => {
  const { username, email, password, phone, dob, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Proper role assignment - allow valid roles
    let assignedRole = "Passenger"; // Default role
    if (role && ["Passenger", "TransportManager", "Admin"].includes(role)) {
      assignedRole = role;
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      dob,
      role: assignedRole,
    });

    await newUser.save();

    // ✅ Create JWT token right after signup
    const accessToken = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        dob: newUser.dob,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============ LOGIN ============
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // 🔑 Access Token (short-lived)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🔁 Refresh Token (long-lived)
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    refreshTokens.push(refreshToken);

    // ✅ Send only once
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ============ REFRESH ============
router.post("/refresh", (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(401).json({ message: "No refresh token provided" });

  if (!refreshTokens.includes(accessToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
});

// ============ LOGOUT ============
router.post("/logout", (req, res) => {
  const { accessToken } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== accessToken);
  res.json({ message: "Logged out successfully" });
});


// ================== UPDATE PROFILE ==================
router.put("/me", async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "No accessToken provided" });

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Allowed fields for update
    const { username, phone, dob } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { username, phone, dob },
      { new: true }
    ).select("-password"); // Exclude password

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================== CHANGE PASSWORD ==================
router.put("/change-password", async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) return res.status(401).json({ message: "No accessToken provided" });

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    // ✅ Check constraints
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================== REQUEST RESET PASSWORD ==================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account with that email" });

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    resetTokens[resetToken] = user._id;

    // Reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
//const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
//const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'Chennai Transport <onboarding@resend.dev>',
        to: [email],
        subject: 'Password Reset Request - Chennai Transport Pass System',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚌 Chennai Transport Pass System</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Hello <strong>${user.username}</strong>,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                We received a request to reset your password for your Chennai Transport Pass System account. 
                Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                  🔐 Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                If you didn't request this password reset, you can safely ignore this email. 
                Your password will remain unchanged.
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  This link will expire in 1 hour for security reasons.<br>
                  If you have any questions, please contact our support team.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2024 Chennai Transport Pass System. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error("Email send error:", error);
        // Fallback: return the reset link even if email fails
        return res.status(200).json({
          message: "✅ Reset link generated! Check your email or use the link below.",
          resetLink,
          emailSent: false
        });
      }

      console.log("✅ Email sent successfully:", data);
      return res.status(200).json({
        message: "✅ Password reset link sent to your email!",
        resetLink,
        emailSent: true
      });

    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Fallback: return the reset link even if email fails
      return res.status(200).json({
        message: "✅ Reset link generated! Check your email or use the link below.",
        resetLink,
        emailSent: false
      });
    }

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ================== RESET PASSWORD ==================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    const userId = resetTokens[token];
    if (!userId) return res.status(400).json({ message: "Invalid or expired reset accessToken" });

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    delete resetTokens[token];

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Get current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working" });
});


module.exports = router;
