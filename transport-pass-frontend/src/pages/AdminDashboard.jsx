import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPasses: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activePasses: 0,
    todayRevenue: 0,
    todayPasses: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    averageTransactionValue: 0,
    systemHealth: "Excellent",
    topTransportModes: []
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
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

    // Role-based access control
    if (user?.role !== "Admin") {
      navigate("/dashboard");
      return;
    }

    fetchDashboardData();
  }, [navigate, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      
      // Fetch admin-specific dashboard data
      const response = await api.get("/dashboard/admin", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setStats(response.data.stats || {});
      setRecentUsers(response.data.recentUsers || []);
      setRecentTransactions(response.data.recentTransactions || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty data instead of mock data
      setStats({
        totalUsers: 0,
        totalPasses: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        activePasses: 0,
        todayRevenue: 0,
        todayPasses: 0,
        monthlyRevenue: 0,
        weeklyRevenue: 0,
        averageTransactionValue: 0,
        systemHealth: "Excellent",
        topTransportModes: []
      });
      setRecentUsers([]);
      setRecentTransactions([]);
      } finally {
        setLoading(false);
      }
    };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800";
      case "TransportManager":
        return "bg-blue-100 text-blue-800";
      case "Passenger":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const getTransactionPassType = (transaction) => {
    // Prefer explicit fields, fall back to nested pass object if present
    return (
      
      transaction.passType ||
      transaction.mode ||
      transaction.pass?.passType ||
      transaction.pass?.mode ||
      "Unknown"
    );
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

  const getSystemHealthColor = () => {
    switch (stats.systemHealth) {
      case "Excellent": return "bg-green-100 text-green-800";
      case "Good": return "bg-blue-100 text-blue-800";
      case "Fair": return "bg-yellow-100 text-yellow-800";
      case "Poor": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
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
            👨‍💻 Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            System-wide overview and management for Chennai Transport Pass System
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Welcome, {user?.username || "Administrator"}! You have full system access.
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
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
                <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.averageTransactionValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Passes</p>
              <p className="text-3xl font-bold text-green-600">{stats.activePasses?.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Today's Passes</p>
              <p className="text-3xl font-bold text-blue-600">{stats.todayPasses}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">System Health</p>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSystemHealthColor()}`}>
                {stats.systemHealth}
              </span>
            </div>
          </div>
        </div>

        {/* Transport Mode Revenue Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Transport Mode Revenue Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.topTransportModes?.map((mode, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{getPassTypeIcon(mode._id)}</span>
                  <h3 className="font-semibold text-gray-800">{mode._id}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Passes:</span>
                    <span className="font-semibold text-blue-600">{mode.count?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-semibold text-green-600">₹{mode.revenue?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Price:</span>
                    <span className="font-semibold text-purple-600">₹{mode.count > 0 ? Math.round(mode.revenue / mode.count) : 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Recent Users and Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pass Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.userId?.username || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {(() => { const pt = getTransactionPassType(transaction); return (
                            <>
                              <span className="text-lg mr-2">{getPassTypeIcon(pt)}</span>
                              <span className="text-sm text-gray-900">{pt}</span>
                            </>
                          ); })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
              <p className="text-blue-100">View and manage all users</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/passes")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-semibold mb-2">View All Passes</h3>
              <p className="text-green-100">Monitor all transport passes</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/transactions")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">All Transactions</h3>
              <p className="text-yellow-100">View financial transactions</p>
        </div>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Settings</h3>
              <p className="text-purple-100">System configuration</p>
        </div>
          </button>
        </div>
      </div>
    </div>
  );
}
