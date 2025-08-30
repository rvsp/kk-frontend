import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import { useAccessControl } from "../../utils/useAccessControl";

const AccountList = () => {
  const { isReadOnly } = useAccessControl();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "Bank",
    balance: 0,
    note: "",
  });

  const [loading, setLoading] = useState(false); // for submit
  const [fetching, setFetching] = useState(true); // for initial data load
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setFetching(true);
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "balance" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.type) {
      setError("Name and type are required.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/accounts", {
        ...formData,
        balance: parseFloat(formData.balance),
      });
      setFormData({ name: "", type: "Bank", balance: 0, note: "" });
      await fetchAccounts();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Accounts</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 bg-white p-4 rounded-lg shadow"
      >
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          >
            <option value="">Select Type</option>
            <option value="Bank">Bank</option>
            <option value="UPI">UPI</option>
            <option value="Investment">Investment</option>
            <option value="Wallet">Wallet</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Initial Balance</label>
          <input
            type="number"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded p-2"
          />
        </div>

        {error && <div className="text-red-600 font-medium">{error}</div>}

        <button
          type="submit"
          disabled={isReadOnly || loading}
          title={isReadOnly ? "You have read-only Access" : ""}
          className={`btn w-fit ${
            !isReadOnly ? "btn-primary" : "btn-secondary"
          }`}
        >
          {loading ? "Adding..." : "Add Account"}
        </button>
      </form>

      {/* Account List */}
      <div className="mt-5 bg-white rounded-lg shadow">
        <h3 className="text-xl font-medium border-b p-4">Your Accounts</h3>

        {fetching ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <ul className="divide-y">
            {accounts.length === 0 ? (
              <li className="p-4 text-gray-500">No accounts found</li>
            ) : (
              accounts.map((acc) => (
                <li
                  key={acc._id}
                  className="p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="font-semibold">
                      {acc.name}{" "}
                      <span className="italic text-gray-500 text-sm">
                        ({acc.type})
                      </span>
                    </p>
                    {acc.note && (
                      <p className="text-sm text-gray-500">{acc.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">
                      ₹ {acc.balance.toFixed(2)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccountList;
