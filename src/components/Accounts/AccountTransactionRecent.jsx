import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { formatCurrency, formatDateTime } from "../../utils/helpers";
import LoadingSpinner from "../Common/LoadingSpinner";

const AccountTransactionRecent = ({ month, year }) => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (month !== undefined && year !== undefined) {
      fetchRecentTransactions();
    }
  }, [month, year]);

  const fetchRecentTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/account-transactions/recent", {
        params: { month, year },
      });
      setRecentTransactions(res.data || []);
    } catch (err) {
      console.error("Error fetching expense summary:", err);
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        💸 Recent Transactions
      </h3>
      {recentTransactions.length === 0 ? (
        <p className="text-sm text-gray-500">No Transaction data available.</p>
      ) : (
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2">Note</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date</th>
              <th className="p-2">From/To Account</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{item?.note}</td>
                <td className="p-2">{item?.type}</td>
                <td className="p-2">{formatDateTime(item?.date)}</td>
                <td className="p-2">
                  {/* If it’s a normal account transaction */}
                  {item?.accountId && <span>{item.accountId.name}</span>}
                  {/* If it’s a transfer, show from -> to */}
                  {item?.fromAccountId && (
                    <span>{item.fromAccountId.name}</span>
                  )}
                  {item?.toAccountId && (
                    <span>
                      {" "}
                      → {item.toAccountId.name} ({item.toAccountId.type})
                    </span>
                  )}
                </td>
                <td className="p-2 font-medium text-gray-900">
                  {formatCurrency(item?.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AccountTransactionRecent;
