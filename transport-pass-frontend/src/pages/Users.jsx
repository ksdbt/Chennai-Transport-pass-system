import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const accessToken = localStorage.getItem("accessToken");

  // Wrap fetchUsers in useCallback
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users:", err.response?.data || err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    // Role-based access control
    if (user?.role !== "Admin") {
      alert("Access denied. Only Administrators can manage users.");
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [fetchUsers, user, navigate]);

  // Change user role
  const changeRole = async (id, newRole) => {
    try {
      await api.put(
        `/users/${id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      fetchUsers(); // refresh user list after change
    } catch (err) {
      console.error("Role update failed", err);
      alert("❌ Could not update role");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchUsers(); // refresh user list after delete
    } catch (err) {
      console.error("Delete failed", err);
      alert("❌ Could not delete user");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              👥 Manage Users
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome, {user?.username || "Administrator"}! Manage all system
              users.
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Users ({users.length})
              </h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
  {users.map((userItem) => (
    <tr key={userItem._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {userItem.username}
          </div>
          <div className="text-sm text-gray-500">
            {userItem.email}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
          {userItem.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(userItem.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {/* Show dropdown only for Admin */}
          {user?.role === "Admin" && userItem.role !== "Admin" && userItem.role !== "Passenger" && (
            <select
              value={userItem.role}
              onChange={(e) => changeRole(userItem._id, e.target.value)} // Admin can change role to Admin
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {/* Only Managers can be promoted to Admin */}
              {userItem.role === "TransportManager" && (
                <option value="Admin">Transport Manager</option>
                
              )}
              <option value="Admin">Admin</option>
            </select>
          )}

          {/* Delete Button */}
          <button
            onClick={() => deleteUser(userItem._id)}
            className="text-red-600 hover:text-red-900 text-xs"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

              </table>
            </div>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                No users have been registered yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
