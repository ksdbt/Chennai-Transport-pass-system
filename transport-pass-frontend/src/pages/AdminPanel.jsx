import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminPanel() {
const [stats, setStats] = useState({
totalUsers: null,
totalPasses: null,
totalRevenue: null,
});

useEffect(() => {
const fetchStats = async () => {
try {
const res = await api.get("/dashboard/admin-summary"); // You’ll add this route backend next
setStats(res.data);
} catch (err) {
console.error("Error fetching admin summary:", err);
}
};
fetchStats();
}, []);
return (
<div className="min-h-screen bg-gray-100 p-4">
<h1 className="text-3xl font-bold text-center text-blue-700 mb-6">👑 Admin Dashboard</h1>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-sm text-gray-600">📋 Total Users</p>
      <h2 className="text-2xl font-bold">{stats.totalUsers ?? "..."}</h2>
    </div>
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-sm text-gray-600">🎫 Total Passes Issued</p>
      <h2 className="text-2xl font-bold">{stats.totalPasses ?? "..."}</h2>
    </div>
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-sm text-gray-600">💳 Total Revenue</p>
      <h2 className="text-2xl font-bold">₹{stats.totalRevenue ?? "..."}</h2>
    </div>
  </div>

  <div className="text-center mt-8 space-x-4">
    <a href="/users" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Manage Users
    </a>
    <a href="/passes" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
      View Passes
    </a>
    <a href="/transactions" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
      View Transactions
    </a>
  </div>
</div>


);
}
