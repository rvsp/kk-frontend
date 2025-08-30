import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const AccountBalanceCard = () => {
  const { privacyMode } = useAuth();
  const [accountConsolidated, setAccountConsolidated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountConsolidated();
  }, []);

  const fetchAccountConsolidated = async () => {
    try {
      const res = await api.get("/accounts/acc-consolidated");
      const result = res.data.filter((t) => t.type !== "investment");
      setAccountConsolidated(result);
    } catch (err) {
      console.error("Error fetching account summary:", err);
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
    <div className="bg-white shadow rounded-2xl p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">🏦 Accounts</h2>

      {accountConsolidated.length === 0 ? (
        <p className="text-sm text-gray-500">No accounts found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Account Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {accountConsolidated.map((acc) => (
                <tr key={acc._id}>
                  <td className="px-4 py-2 text-gray-800">{acc.name}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      acc.balance > 0 ? "text-green-600" : "text-red-600"
                    } `}
                  >
                    {privacyMode ? "*****" : `₹${acc.balance.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountBalanceCard;
