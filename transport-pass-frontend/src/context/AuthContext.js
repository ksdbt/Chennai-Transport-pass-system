// src/context/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;
    (async () => {
      try {
        // Prefer authoritative server user (has role)
        const res = await api.get("/auth/me");
        setUser(res.data);
        setIsLoggedIn(true);
      } catch (_err) {
        // Fallback to decoded token if /auth/me fails
        try {
          const decoded = jwtDecode(accessToken);
          setUser(decoded);
          setIsLoggedIn(true);
        } catch (err) {
          console.error("Invalid token:", err);
          localStorage.removeItem("accessToken");
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    })();
  }, []);

  const login = (accessToken, userData) => {
    localStorage.setItem("accessToken", accessToken);
    // Prefer provided server user object (has role), fallback to decoded
    if (userData) {
      setUser(userData);
      setIsLoggedIn(true);
      return;
    }
    try {
      const decoded = jwtDecode(accessToken);
      setUser(decoded);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Invalid token during login:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
