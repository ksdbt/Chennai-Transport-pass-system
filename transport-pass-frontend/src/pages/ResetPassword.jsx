import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
  const {token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    // ✅ Password validations
    if (newPassword !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("❌ Password must be at least 6 characters");
      return;
    }

    try {
      await api.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword,
          confirmPassword,
         }
      );

      alert("✅ Password reset successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Reset failed", err.response?.data || err.message);
      alert(err.response?.data?.message || "Reset failed. Try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Reset password</h1>
        <p className="text-center text-gray-500 mb-8">Enter a new password for your account</p>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-l-lg focus:outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="button" className="px-4 text-sm text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
