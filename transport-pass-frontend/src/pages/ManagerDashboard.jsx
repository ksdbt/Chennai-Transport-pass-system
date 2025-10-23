import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalPasses: 0,
    activePasses: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averagePassValue: 0,
    topRoutes: []
  });
  const [recentPasses, setRecentPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }

    // Role-based access control (silent redirect, no alert to avoid extra popups)
    if (user?.role !== "TransportManager") {
      navigate("/dashboard");
      return;
    }

    fetchDashboardData();
  }, [navigate, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      // Fetch manager-specific dashboard data
      const response = await api.get("/dashboard/manager", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setStats(response.data.stats || {});
      setRecentPasses(response.data.recentPasses || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty data instead of mock data
      setStats({
        totalPasses: 0,
        activePasses: 0,
        todayPasses: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        averagePassValue: 0,
        topRoutes: []
      });
      setRecentPasses([]);
    } finally {
      setLoading(false);
    }
  };

  const getPassTypeIcon = (passType) => {
    switch (passType) {
      case "Bus": return "🚌";
      case "Train": return "🚆";
      case "Metro": return "🚇";
      case "All-in-One": return "🎫";
      default: return "🎫";
    }
  };

  const getPassStatus = (validTo) => {
    const now = new Date();
    const endOfValidTo = new Date(validTo);
    endOfValidTo.setHours(23, 59, 59, 999);
    return now <= endOfValidTo ? "Active" : "Expired";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRevenueForTimeframe = () => {
    switch (selectedTimeframe) {
      case "today": return stats.todayRevenue;
      case "weekly": return stats.weeklyRevenue;
      case "monthly": return stats.monthlyRevenue;
      default: return stats.totalRevenue;
    }
  };

  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case "today": return "Today's Revenue";
      case "weekly": return "This Week's Revenue";
      case "monthly": return "This Month's Revenue";
      default: return "Total Revenue";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚌 Transport Authority Manager Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor passes, revenue, and system analytics for your transport mode
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Welcome, {user?.username || "Manager"}! You have access to transport management features.
          </div>
        </div>

        {/* Revenue Timeframe Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Overview</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { id: "today", label: "Today", icon: "📅" },
              { id: "weekly", label: "This Week", icon: "📊" },
              { id: "monthly", label: "This Month", icon: "📈" },
              { id: "total", label: "All Time", icon: "💰" }
            ].map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedTimeframe === timeframe.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {timeframe.icon} {timeframe.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Passes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPasses?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Passes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activePasses?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{getTimeframeLabel()}</p>
                <p className="text-3xl font-bold text-gray-900">₹{getRevenueForTimeframe()?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Pass Value</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.averagePassValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Performing Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.topRoutes?.map((route, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-800">{route.route}</h3>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{route.count} passes sold</span>
                  <span className="font-semibold text-green-600">₹{route.revenue?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Passes */}
        <div className="bg-white rounded-2xl shadow-xl mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Passes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pass Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPasses.map((pass) => (
                  <tr key={pass._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {pass.userId?.username || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pass.userId?.email || "No email"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getPassTypeIcon(pass.passType)}</span>
                        <span className="text-sm text-gray-900">{pass.passType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pass.validFrom).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pass.validTo).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const status = getPassStatus(pass.validTo);
                        return (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{pass.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pass.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/passes")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-semibold mb-2">View All Passes</h3>
              <p className="text-blue-100">Browse and filter all passes</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">View Transactions</h3>
              <p className="text-green-100">Monitor all financial transactions</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-xl font-semibold mb-2">Profile Settings</h3>
              <p className="text-purple-100">Manage your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
