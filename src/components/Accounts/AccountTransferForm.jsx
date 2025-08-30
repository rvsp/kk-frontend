import React, { useEffect, useState } from "react";
import api from "../../services/api";

const AccountTransferForm = ({ onSuccess = () => {}, onCancel }) => {
  const [type, setType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [note, setNote] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const [detectedType, setDetectedType] = useState("transfer"); // can be transfer or investment

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  // Detect transfer to investment account and update type
  useEffect(() => {
    const toAcc = accounts.find((a) => a._id === toAccountId);
    if (toAcc?.type === "investment") {
      setDetectedType("investment");
      if (!note) setNote("Investment from salary");
    } else {
      setDetectedType("transfer");
    }
  }, [toAccountId, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        type: detectedType,
        amount: parseFloat(amount),
        fromAccountId,
        toAccountId,
        note,
        date,
      };

      await api.post("/account-transactions", payload);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to perform transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Account Transfer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Transaction Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={detectedType === "investment"}
          >
            <option value="deposit">Deposit</option>
            <option value="transfer">Transfer</option>
          </select>
          {detectedType === "investment" && (
            <p className="text-sm text-blue-600 mt-1">
              ➤ This will be recorded as an <strong>Investment</strong>.
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">
            From Account
            {fromAccountId && (
              <span className="mt-1 text-xs text-gray-500 italic">
                {`: ${accounts
                  .find((acc) => acc._id === fromAccountId)
                  .balance.toFixed(2)}`}
              </span>
            )}
          </label>
          <select
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select From Account</option>
            {accounts.map((acc) => (
              <option
                key={acc._id}
                value={acc._id}
                disabled={acc._id === toAccountId}
              >
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">To Account</label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select To Account</option>
            {accounts.map((acc) => (
              <option
                key={acc._id}
                value={acc._id}
                disabled={acc._id === fromAccountId}
              >
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Transaction Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Salary for July or SIP"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "🕒 Processing..." : "🚀 Submit"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>

        {error && <div className="text-red-600 mt-2 font-medium">{error}</div>}
      </form>
    </div>
  );
};

export default AccountTransferForm;
