import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const rawToken = localStorage.getItem("token");
        const rawUser = localStorage.getItem("user");
        const rawHousehold = localStorage.getItem("household");

        if (rawToken) {
          api.defaults.headers.common["Authorization"] = `Bearer ${rawToken}`;
        }

        if (rawUser && rawUser.startsWith("{")) {
          setUser(JSON.parse(rawUser));
        }

        if (rawHousehold && rawHousehold.startsWith("{")) {
          setHousehold(JSON.parse(rawHousehold));
        }
      } catch (err) {
        console.error("Auth init error:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("household");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userName, password, locationData = null) => {
    try {
      const response = await api.post("/auth/login", {
        userName,
        password,
        clientLocation: locationData,
      });
      const { token, user, household } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("household", JSON.stringify(household));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setHousehold(household);
      setPrivacyMode(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, userName, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        userName,
        email,
        password,
      });
      const { token, user, household } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("household", JSON.stringify(household));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setHousehold(household);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("household");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setHousehold(null);
  };

  const togglePrivacyMode = () => setPrivacyMode((prev) => !prev);

  const value = {
    user,
    household,
    login,
    register,
    logout,
    loading,
    togglePrivacyMode,
    privacyMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
