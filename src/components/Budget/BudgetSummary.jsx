import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import ProgressBar from "../Common/ProgressBar";

const BudgetSummary = ({ month, year }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (month !== undefined && year !== undefined) {
      fetchSummary();
    }
  }, [month, year]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budgets/summary`, {
        params: { month, year },
      });
      setSummary(res.data || []);
    } catch (err) {
      console.error("Failed to fetch budget summary", err);
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
    <div className="bg-white rounded-2xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">📊 Budget Summary</h2>

      {summary.length === 0 ? (
        <p className="text-sm text-gray-500">No budget data available.</p>
      ) : (
        <div className="space-y-6">
          {summary.map((b, index) => {
            const percentage = b.budgeted ? (b.spent / b.budgeted) * 100 : 0;

            // Color override logic
            let barColor = null;
            if (percentage >= 100) barColor = "bg-red-500";
            else if (percentage >= 80) barColor = "bg-yellow-500";

            return (
              <div key={index} className="">
                <div className="flex justify-between items-center">
                  <div className="text-sm">{b.category}</div>
                  <span className="text-sm">{percentage.toFixed(1)} %</span>
                </div>

                <ProgressBar
                  value={b.spent}
                  max={b.budgeted}
                  color={barColor}
                />

                <div className="text-xs mt-1 italic">
                  Budget: ₹{b.budgeted.toLocaleString()} | Spent: ₹
                  {b.spent.toLocaleString()} | Remaining: ₹
                  {(b.budgeted - b.spent).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;
