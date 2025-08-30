import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAccessControl } from "../../utils/useAccessControl";

const SalaryEntryForm = ({ onSuccess, onClose }) => {
  const { isReadOnly } = useAccessControl();
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/account-transactions/salary", {
        accountId,
        amount: parseFloat(amount),
        note,
        date,
      });

      setMessage("✅ Salary recorded successfully");
      setAmount(0);
      setNote("");
      setAccountId("");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error("Salary entry error:", err);
      setMessage(err?.response?.data?.message || "❌ Failed to record salary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-5 mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Add Salary</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Account
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Choose an account --</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name} (₹{acc.balance.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter salary amount"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Enter Date"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="E.g. Monthly salary"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none"
          />
        </div>

        {message && (
          <div className="text-sm text-center text-blue-600">{message}</div>
        )}

        <div className="flex justify-end space-x-2 pt-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm text-gray-700"
            >
              Cancel
            </button>
          )}
          <button
            title={isReadOnly ? "You have read-only Access" : ""}
            disabled={isReadOnly}
            type="submit"
            className={`px-4 py-2 rounded btn ${
              !isReadOnly
                ? "btn-primary text-sm hover:bg-blue-700 disabled:opacity-50"
                : "btn-secondary"
            }`}
          >
            {loading ? "⏳ Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalaryEntryForm;
