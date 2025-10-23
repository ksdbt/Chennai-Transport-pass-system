import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";  // Updated import

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dob: "",
    role: "Passenger",
  });
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Stronger password validation (8+ chars, uppercase, lowercase, number, special char)
  const isPasswordValid = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
const handleSignup = async (e) => {
  e.preventDefault();
  const { username, email, password, confirmPassword, phone, dob, role } = formData;

  // ✅ Validation
  if (!username || !email || !password || !confirmPassword || !phone || !dob || !role) {
    setError("⚠️ Please fill all fields");
    return;
  }
  if (password !== confirmPassword) {
    setError("⚠️ Passwords do not match");
    return;
  }
  if (!isPasswordValid(password)) {
    setError("⚠️ Password must be at least 8 characters long");
    return;
  }


  try {
    const res = await api.post("http://localhost:5000/api/auth/signup", formData);

    // 🔑 Save token + user
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    alert("🎉 Signup successful! You can now log in.");
    // No redirect after signup
    // Optionally, you could navigate to a common page like Login:
    navigate("/login");
  } catch (err) {
    console.error("❌ Signup failed", err.response?.data || err.message);
    setError(err.response?.data?.message || "Signup failed. Try again.");
  }
};


  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Create your account</h1>
        <p className="text-center text-gray-500 mb-8">Join Chennai Transport to purchase and manage passes</p>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Username */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Username</label>
            <input
              name="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full px-4 py-3 rounded-l-lg focus:outline-none"
                placeholder="••••••••"
                value={formData.password}
                autoComplete="new-password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="px-4 text-sm text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="w-full px-4 py-3 rounded-l-lg focus:outline-none"
                placeholder="••••••••"
                value={formData.confirmPassword}
                autoComplete="new-password"
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="px-4 text-sm text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="[0-9]{10}" // ✅ allows only 10 digits
              maxLength="10"
              required
            />
            <small className="text-gray-500">
              Enter 10-digit mobile number
            </small>
          </div>

          {/* Date of Birth */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Passenger">Passenger</option>
              <option value="TransportManager">
                Transport Authority Manager
              </option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Create Account
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
