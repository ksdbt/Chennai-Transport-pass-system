import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
  e.preventDefault();

  // 1. All fields required
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("All fields are required");
    return;
  }

  // 2. New password must match confirm
  if (newPassword !== confirmPassword) {
    alert("❌ New password and confirm password do not match");
    return;
  }

  // 3. New password must not equal current
  if (currentPassword === newPassword) {
    alert("❌ New password must be different from current password");
    return;
  }

  // 4. Enforce password strength
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(newPassword)) {
    alert("⚠️ Password must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character");
    return;
  }

  try {
    const accessToken = localStorage.getItem("accessToken");
    await api.put(
      "http://localhost:5000/api/auth/change-password",
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    alert("✅ Password updated successfully!");
    navigate("/profile"); // go back
  } catch (err) {
    console.error("Change password failed", err);
    alert(err.response?.data?.message || "Failed to update password");
  }
};

  const renderPasswordInput = (label, value, setValue, key) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center border rounded">
        <input
          type={show[key] ? "text" : "password"}
          placeholder={label}
          className="w-full p-2 rounded-l"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          //autoComplete={key === "current" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          className="px-3 text-sm text-gray-600"
          onClick={() => setShow({ ...show, [key]: !show[key] })}
        >
          {show[key] ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">Change password</h2>
        <p className="text-center text-gray-500 mb-8">Keep your account secure with a strong password</p>
        <form onSubmit={handleChangePassword} className="space-y-5">
        {renderPasswordInput("Current Password", currentPassword, setCurrentPassword, "current")}
        {renderPasswordInput("New Password", newPassword, setNewPassword, "new")}
        {renderPasswordInput("Confirm New Password", confirmPassword, setConfirmPassword, "confirm")}

          <div className="flex justify-between">
            <button type="submit" className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Update Password
            </button>
            <button type="button" onClick={() => navigate("/profile")} className="bg-gray-500 text-white px-5 py-3 rounded-lg hover:bg-gray-600 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
