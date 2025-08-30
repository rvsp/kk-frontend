import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccess("Password changed successfully. Logging out...");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">{success}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
