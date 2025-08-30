import { useEffect, useState } from "react";
import api from "../services/api";
import { formatDateTime } from "../utils/helpers";
import LoadingSpinner from "../components/Common/LoadingSpinner";

const LoginAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/attempts");
      setAttempts(res.data);
    } catch (err) {
      console.error("fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-6">
      <div className="text-lg font-semibold text-gray-800 mb-4">
        Recent Login Attempts
      </div>
      <div className="w-full text-sm text-left">
        {attempts.length === 0 ? (
          <p className="text-gray-400 italic">No login attempts found</p>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a) => (
              <li
                key={a._id}
                className={`text-sm flex justify-between border-b pb-2 ${
                  a.success ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>
                  <span className="font-medium">{a.userName}</span>{" "}
                  {a.success ? "✓" : "✗"}
                  <br />
                  <div className="text-xs text-gray-500">
                    {a.location?.displayName || "Unknown"},{" "}
                    {a.location?.countryCode || "N/A"} • {a?.ip || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {a.device?.os || "Unknown OS"} •{" "}
                    {a.device?.browser || "Unknown Browser"} •{" "}
                    {a.device?.device || "Unknown Device"}
                  </div>
                </span>
                <span className="text-xs text-gray-400">
                  {formatDateTime(a.timestamp)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LoginAttempts;
