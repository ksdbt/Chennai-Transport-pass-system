import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("view"); // "view", "edit", "password"
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          navigate("/login");
          return;
        }
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(res.data);
        setFormData({
          username: res.data.username,
          phone: res.data.phone,
          dob: res.data.dob?.split("T")[0],
        });
      } catch (err) {
        console.error("❌ Failed to fetch user", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const accessToken = localStorage.getItem("accessToken");
      const res = await api.put("/auth/me", formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(res.data);
      setMode("view");
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("❌ Profile update failed", err);
      alert("Failed to update profile. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      setUpdating(true);
      const accessToken = localStorage.getItem("accessToken");
      await api.put("/auth/change-password", passwordData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      alert("✅ Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMode("view");
    } catch (err) {
      console.error("❌ Change password failed", err);
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setUpdating(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin": return "👨‍💻";
      case "TransportManager": return "🧑‍💼";
      case "Passenger": return "👤";
      default: return "👤";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800 border-red-200";
      case "TransportManager": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Passenger": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              👤 User Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Overview Card */}
            <div className="lg:w-1/3 flex flex-col">
              <div className="bg-white rounded-2xl shadow-xl flex flex-col items-center text-center h-full min-h-[540px] justify-center px-6 py-8">
                {/* Avatar */}
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
                  <span className="text-4xl text-white font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* User Name and Email */}
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {user.username}
                </h2>
                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                {/* Role Badge */}
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleIcon(user.role)} {user.role}
                </div>
                {/* Additional Info */}
                <div className="w-full space-y-4">
                  <div className="flex items-center space-x-3 bg-blue-50 rounded-lg p-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">📱</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-green-50 rounded-lg p-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">🎂</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="text-sm font-medium">
                        {new Date(user.dob).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-purple-50 rounded-lg p-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">📅</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="text-sm font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3 flex flex-col">
              <div className="bg-white rounded-2xl shadow-xl flex flex-col h-full min-h-[540px] px-8 py-8 justify-between">
                {/* Mode Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setMode("view")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      mode === "view"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    📋 Profile Info
                  </button>
                  <button
                    onClick={() => setMode("edit")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      mode === "edit"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={() => setMode("password")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      mode === "password"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    🔒 Change Password
                  </button>
                </div>

                {/* View Mode */}
                {mode === "view" && (
                  <div className="flex flex-col justify-center flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <h3 className="font-medium text-gray-800 mb-4">
                          Personal Information
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Username:</span>
                            <span className="font-medium">{user.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{user.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Date of Birth:
                            </span>
                            <span className="font-medium">
                              {new Date(user.dob).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-4">
                          Account Information
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Role:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)} {user.role}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Member Since:</span>
                            <span className="font-medium">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium">
                              {new Date(user.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Mode */}
                {mode === "edit" && (
                  <form onSubmit={handleUpdate} className="flex flex-col justify-center flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          required
                        />
                        <small className="text-gray-500">
                          Enter 10-digit mobile number
                        </small>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {updating ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Updating...
                          </div>
                        ) : (
                          "✅ Save Changes"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("view")}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Password Change Mode */}
                {mode === "password" && (
                  <form onSubmit={handleChangePassword} className="flex flex-col justify-center flex-1 space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
                      <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <p className="text-sm text-yellow-800">
                          Make sure your new password is strong and different
                          from your current password.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex space-x-3 mt-2">
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {updating ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Updating...
                          </div>
                        ) : (
                          "🔑 Update Password"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("view")}
                        className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
