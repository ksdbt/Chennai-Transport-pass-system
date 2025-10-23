import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import ManagerDashboard from "./ManagerDashboard";
import Dashboard from "./Dashboard";
import { Link } from "react-router-dom";
export default function Home() {
  const [loading, setLoading] = useState(true);
  //const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setLoading(false);
    }
  }, [isLoggedIn, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If logged in, render role-specific dashboard
  if (isLoggedIn && user) {
    if (user.role === "Admin") return <AdminDashboard />;
    if (user.role === "TransportManager") return <ManagerDashboard />;
    return <Dashboard />;
  }

  // Show landing page if not logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mt-4 mb-2">
              <span role="img" aria-label="bus">
                🚍
              </span>{" "}
              Chennai Transport Pass System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience seamless, digital travel across Bus, Train, Metro, and
              All-in-One passes. One platform, multiple transport options,
              endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
              >
                🚀 Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-medium text-lg border-2 border-blue-600 shadow-lg hover:shadow-xl"
              >
                🔑 Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose Our Transport Pass System?
            </h2>
            <p className="text-gray-600 text-lg">
              Modern, secure, and convenient travel solutions for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-4xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Multiple Transport Modes
              </h3>
              <p className="text-gray-600">
                Bus, Train, Metro, and All-in-One passes in one platform
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-600">
                Multiple payment options with secure transaction processing
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Digital QR Codes
              </h3>
              <p className="text-gray-600">
                Instant QR code generation for hassle-free travel
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Real-time Analytics
              </h3>
              <p className="text-gray-600">
                Comprehensive insights and usage statistics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Modes Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Available Transport Modes
            </h2>
            <p className="text-gray-600 text-lg">
              Choose from our comprehensive range of transport options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Bus Network
              </h3>
              <p className="text-gray-600 mb-4">
                Extensive bus routes covering all major areas of Chennai
              </p>
              <div className="text-sm text-blue-600 font-medium">
                From ₹50/day
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚆</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Train Services
              </h3>
              <p className="text-gray-600 mb-4">
                Fast and reliable train connections across the city
              </p>
              <div className="text-sm text-blue-600 font-medium">
                From ₹50/day
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚇</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Metro Rail
              </h3>
              <p className="text-gray-600 mb-4">
                Modern metro system for quick urban transportation
              </p>
              <div className="text-sm text-blue-600 font-medium">
                From ₹50/day
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                All-in-One Pass
              </h3>
              <p className="text-gray-600 mb-4">
                Unlimited access to all transport modes
              </p>
              <div className="text-sm text-blue-600 font-medium">
                From ₹100/day
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pass Types Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Flexible Pass Options
            </h2>
            <p className="text-gray-600 text-lg">
              Choose the duration that works best for your travel needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8 text-center border-2 border-yellow-200">
              <div className="text-4xl mb-4">🌅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                One Day Pass
              </h3>
              <p className="text-gray-600 mb-4">
                Perfect for daily commuters and occasional travelers
              </p>
              <div className="text-3xl font-bold text-blue-600 mb-4">₹50</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ 24-hour validity</li>
                <li>✓ Unlimited rides</li>
                <li>✓ All transport modes</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border-2 border-blue-200">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Weekly Pass
              </h3>
              <p className="text-gray-600 mb-4">
                Ideal for regular commuters and weekly travelers
              </p>
              <div className="text-3xl font-bold text-blue-600 mb-4">₹250</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ 7-day validity</li>
                <li>✓ Unlimited rides</li>
                <li>✓ All transport modes</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border-2 border-green-200">
              <div className="text-4xl mb-4">📆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Monthly Pass
              </h3>
              <p className="text-gray-600 mb-4">
                Best value for daily commuters and long-term travelers
              </p>
              <div className="text-3xl font-bold text-blue-600 mb-4">₹800</div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ 30-day validity</li>
                <li>✓ Unlimited rides</li>
                <li>✓ All transport modes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Get your transport pass in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">Create your account in seconds</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Choose Pass
              </h3>
              <p className="text-gray-600">
                Select your preferred transport mode and duration
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Pay Securely
              </h3>
              <p className="text-gray-600">
                Complete payment with multiple options
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Start Traveling
              </h3>
              <p className="text-gray-600">
                Get your QR code and start your journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of commuters who trust our transport pass system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg shadow-lg"
            >
              🚀 Create Account
            </Link>
            <Link
              to="/login"
              className="bg-transparent text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium text-lg border-2 border-white"
            >
              🔑 Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer (only one footer on the page) */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
              <h3 className="text-xl font-bold mb-4">🚍 Chennai Transport</h3>
              <p className="text-gray-300">
                Modern, secure, and convenient transport solutions for the city of Chennai.
          </p>
        </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/signup" className="hover:text-white">Sign Up</a></li>
                <li><a href="/login" className="hover:text-white">Sign In</a></li>
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Transport Modes</h4>
              <ul className="space-y-2 text-gray-300">
                <li>🚌 Bus Network</li>
                <li>🚆 Train Services</li>
                <li>🚇 Metro Rail</li>
                <li>🎫 All-in-One Pass</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📧 help@chennaitransport.com</li>
                <li>📞 1800-123-4567</li>
                <li>💬 Live Chat</li>
                <li>📱 Mobile App</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 Chennai Transport Pass System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
