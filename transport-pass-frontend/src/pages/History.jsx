import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const MODES = ["All", "Bus", "Train", "Metro", "All-in-One"];

export default function History() {
  const [active, setActive] = useState([]);
  const [expired, setExpired] = useState([]);
  const [selectedMode, setSelectedMode] = useState("All");
  const [showExpired, setShowExpired] = useState(false);
  const [expandedPass, setExpandedPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalActive: 0,
    totalExpired: 0,
    totalValue: 0
  });
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Role-based access control
    if (user?.role !== "Passenger") {
      if (user?.role === "Admin") {
        navigate("/admin");
      } else if (user?.role === "TransportManager") {
        navigate("/manager");
      } else {
        navigate("/");
      }
      return;
    }

    const fetchPasses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/history/passes");
        setActive(res.data.active || []);
        setExpired(res.data.expired || []);
        
        // Calculate stats
        const totalActive = res.data.active?.length || 0;
        const totalExpired = res.data.expired?.length || 0;
        const totalValue = [...(res.data.active || []), ...(res.data.expired || [])]
          .reduce((sum, pass) => sum + (pass.amount || 0), 0);
        
        setStats({ totalActive, totalExpired, totalValue });
      } catch (err) {
        console.error("❌ Error fetching pass history:", err.response?.data || err.message);
        setActive([]);
        setExpired([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, [user, navigate]);

  const filtered = (passes) =>
    selectedMode === "All" ? passes : passes.filter((p) => p.mode === selectedMode);

  const getPassTypeIcon = (mode) => {
    switch (mode) {
      case "Bus": return "🚌";
      case "Train": return "🚆";
      case "Metro": return "🚇";
      case "All-in-One": return "🎫";
      default: return "🎫";
    }
  };

  const daysBetween = (start, end) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.round((e - s) / msPerDay) + 1; // inclusive days
    } catch (_e) {
      return 0;
    }
  };

  const derivePassType = (pass) => {
    if (!pass?.validFrom) return null;
    const end = pass.validTill || pass.validTo;
    if (!end) return null;
    const d = daysBetween(pass.validFrom, end);
    if (d <= 1) return "One Day";
    if (d <= 7) return "Weekly";
    if (d >= 28) return "Monthly";
    return null;
  };

  const getStatusColor = (isExpired) => {
    return isExpired 
      ? "bg-red-100 text-red-800 border-red-200" 
      : "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusIcon = (isExpired) => {
    return isExpired ? "⏰" : "✅";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderPassCard = (pass, index, isExpired = false) => {
    const isOpen = expandedPass === index;
    const endDate = new Date(pass.validTill || pass.validTo);
    endDate.setHours(23, 59, 59, 999);
    const isActuallyExpired = endDate < new Date();
    
    return (
      <div
        key={index}
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${
          isActuallyExpired ? 'border-l-red-500' : 'border-l-green-500'
        } ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setExpandedPass(isOpen ? null : index)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{getPassTypeIcon(pass.mode)}</div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{pass.mode}</h3>
                <p className="text-sm text-gray-600">
                  {pass.startLocation} → {pass.endLocation}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(isActuallyExpired)}`}>
              {getStatusIcon(isActuallyExpired)} {isActuallyExpired ? 'Expired' : 'Active'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase font-medium">Pass Type</p>
              <p className="font-semibold text-gray-800">{pass.passType || derivePassType(pass) || "N/A"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase font-medium">Amount</p>
              <p className="font-semibold text-gray-800">₹{pass.amount || 0}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-600 uppercase font-medium mb-1">Validity Period</p>
            <p className="text-sm text-gray-800">
              {formatDate(pass.validFrom)} → {formatDate(pass.validTill || pass.validTo)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {isOpen ? "Click to collapse" : "Click to expand"}
            </span>
            <div className="text-blue-600">
              {isOpen ? "▲" : "▼"}
            </div>
          </div>
        </div>

        {isOpen && pass.qrCode && (
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3 text-center">QR Code</p>
              <div className="flex justify-center">
                <img 
                  src={pass.qrCode} 
                  alt="QR Code" 
                  className="w-32 h-32 border-2 border-gray-200 rounded-lg shadow-sm" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your pass history...</p>
        </div>
      </div>
    );
  }

  const currentPasses = showExpired ? expired : active;
  const filteredPasses = filtered(currentPasses);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🕔 Pass History
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {user?.username || "Passenger"}! View your travel pass history.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Passes</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalActive}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="text-2xl">⏰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Expired Passes</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalExpired}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-800">₹{stats.totalValue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Filter Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter by Transport Mode</h2>
            <div className="flex flex-wrap gap-3">
              {MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedMode === mode
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mode === "All" ? "🚀 All Modes" : `${getPassTypeIcon(mode)} ${mode}`}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Active/Expired */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 inline-block">
              <button
                onClick={() => setShowExpired(!showExpired)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  showExpired 
                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {showExpired ? "⬅ Show Active Passes" : "📜 Show Expired Passes"}
              </button>
            </div>
          </div>

          {/* Pass Cards */}
          {filteredPasses.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🎫</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No {showExpired ? "expired" : "active"} passes found
                </h3>
                <p className="text-gray-600 mb-6">
                  {showExpired 
                    ? "You don't have any expired passes yet." 
                    : "You don't have any active passes. Buy your first pass to get started!"
                  }
                </p>
                {!showExpired && (
                  <button
                    onClick={() => navigate("/buy-pass")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🚌 Buy Your First Pass
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPasses.map((pass, index) => renderPassCard(pass, index, showExpired))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
