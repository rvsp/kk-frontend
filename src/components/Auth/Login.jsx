import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";

const Login = () => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState(null); // ✅ fixed
  const { login } = useAuth();

  const [pingStatus, setPingStatus] = useState("");
  const [pinging, setPinging] = useState(true);

  // 🔹 Ping backend only if location is available
  const pingBackend = async () => {
    if (!locationData?.lat || !locationData?.lon) {
      setError("Location access is required to log in.");
      setPinging(false);
      return;
    }

    setPinging(true);
    try {
      const res = await api.get("/render-test");
      if (res.status === 200) {
        setPingStatus(res.data?.message || "✅ App Ready");
      } else {
        setPingStatus("⚠️ Ping Failed: Backend not reachable");
      }
    } catch (err) {
      console.error("❌ Ping failed:", err.message || err);
      setPingStatus("❌ Backend not reachable");
    } finally {
      setPinging(false);
    }
  };

  // 🔹 Get user location
  const fetchLocationData = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationData({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setError(""); // clear error if location allowed
        },
        (err) => {
          console.warn("Geolocation denied:", err);
          setError("Location access denied. Please enable location to login.");
          setLocationData(null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported in this browser.");
    }
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  useEffect(() => {
    if (locationData) {
      pingBackend();
    }
  }, [locationData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!locationData?.lat || !locationData?.lon) {
      setError("Location access is required to log in.");
      return;
    }

    setLoading(true);

    const result = await login(
      formData.userName,
      formData.password,
      locationData
    );

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

      {/* Ping status alert */}
      {pingStatus && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm
            ${
              pingStatus.includes("Ready")
                ? "bg-green-50 text-green-800 border-green-200"
                : pingStatus.includes("not reachable") ||
                  pingStatus.includes("failed")
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-yellow-50 text-yellow-800 border-yellow-200"
            }
          `}
          role="alert"
        >
          <span>{pingStatus}</span>
          <button
            onClick={() => setPingStatus("")}
            className="text-inherit opacity-70 hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading spinner while pinging */}
      {pinging && (
        <div className="flex justify-center items-center py-4 gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-600">
            Connecting to backend...
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset disabled={pinging || loading}>
          <div className="form-group">
            <label htmlFor="userName">User Name</label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary inline-flex items-center"
            disabled={loading || pinging || !locationData?.lat}
          >
            {loading
              ? "Logging in..."
              : pinging
              ? "Waiting for server..."
              : !locationData?.lat
              ? "Enable Location to Login"
              : "Login"}
          </button>
        </fieldset>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
