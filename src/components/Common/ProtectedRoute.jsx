import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner"; // Adjust path if needed

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
