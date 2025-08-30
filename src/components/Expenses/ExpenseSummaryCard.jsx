import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/helpers";
import LoadingSpinner from "../Common/LoadingSpinner";

const ExpenseSummaryCard = ({ month, year }) => {
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (month !== undefined && year !== undefined) {
      fetchExpenseSummary();
    }
  }, [month, year]);

  const fetchExpenseSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/expense-summary", {
        params: { month, year },
      });
      setExpenseSummary(res.data || []);
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
        🧾 Expense Summary by Category
      </h3>
      {expenseSummary.length === 0 ? (
        <p className="text-sm text-gray-500">No summary data available.</p>
      ) : (
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2">Category</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {expenseSummary.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{item.category}</td>
                <td className="p-2 font-medium text-gray-900">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseSummaryCard;
