// src/components/Budget/BudgetList.jsx
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "../../services/api";
import { useAccessControl } from "../../utils/useAccessControl";
import LoadingSpinner from "../Common/LoadingSpinner";

const BudgetList = ({ onEdit, refreshTrigger }) => {
  const { isReadOnly } = useAccessControl();
  const [budgets, setBudgets] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data.budgets || []);
    } catch (err) {
      console.error("Error", err);
      setError("❌ Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await api.delete(`/budgets/${id}`);
      setMessage("✅ Deleted");
      await fetchBudgets();
    } catch (err) {
      setError(`❌ ${err.response?.data?.message || "Delete failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-3 mt-2">
      <h2 className="text-xl font-semibold mb-4">Budgets</h2>

      {/* Alerts */}
      <>
        {message && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm bg-green-50 text-green-800 border-green-200">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="text-inherit opacity-70 hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm bg-red-50 text-red-800 border-red-200">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-inherit opacity-70 hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        )}
      </>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : budgets.length === 0 ? (
        <p className="text-gray-500">No budgets added yet.</p>
      ) : (
        <table className="w-full border mt-2 text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr className="font-semibold bg-gray-100">
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Subcategory</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Month & Year</th>
              {!isReadOnly && <th className="border px-2 py-1">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {budgets.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="border px-2 py-1">{b.category}</td>
                <td className="border px-2 py-1">{b.subcategory || "-"}</td>
                <td className="border px-2 py-1">₹{b.amount}</td>
                <td className="border px-2 py-1">
                  {dayjs().year(b.year).month(b.month).format("MMMM YYYY")}
                </td>
                {!isReadOnly && (
                  <td className="border px-2 py-1">
                    <button onClick={() => onEdit(b)}>
                      <PencilIcon className="w-5 h-5 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(b._id)}>
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BudgetList;
