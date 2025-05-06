import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Footer from "../components/Footer";
import Header from "../components/Header";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Function to decode JWT token
  const decodeJWT = (token) => {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error("Invalid token format");
        return null;
      }
      
      // Base64 decode and parse the payload (second part)
      // Need to handle base64url format by replacing '-' with '+' and '_' with '/'
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      return payload;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post("/admin/login", {
        username: userName,
        password,
      });
      
      console.log("Login response:", response.data);
      
      const { access_token } = response.data;
      
      if (!access_token) {
        setError("Authentication failed: No token received");
        return;
      }
      
      // Decode the token to get the role
      const decodedToken = decodeJWT(access_token);
      console.log("Decoded token:", decodedToken);
      
      if (!decodedToken || !decodedToken.role) {
        setError("Authentication error: Could not determine user role");
        return;
      }
      
      const role = decodedToken.role;
      const expiry = Date.now() + 24 * 60 * 60 * 1000; // 1 day
      
      // Store in localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("tokenExpiry", expiry.toString());
      localStorage.setItem("role", role);
      
      console.log("Role stored:", role);
      
      // Navigate based on role
      if (role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/report");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Admin Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="example123"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLogin;
