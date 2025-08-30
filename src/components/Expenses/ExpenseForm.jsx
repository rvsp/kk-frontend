import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../services/api";
import { FaTimes } from "react-icons/fa";
import dayjs from "dayjs";
import { formatDate } from "../../utils/helpers";

const ExpenseForm = ({ onClose, onSuccess, editData }) => {
  const isEdit = Boolean(editData);

  const defaultForm = {
    amount: "",
    description: "",
    category: "",
    subcategory: "",
    accountId: "",
    date: dayjs().format("YYYY-MM-DD"),
    tripId: "",
  };

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [errors, setErrors] = useState({});
  const [budgetWarning, setBudgetWarning] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, accRes, tripRes] = await Promise.all([
        api.get("/categories"),
        api.get("/accounts"),
        api.get("/trips"),
      ]);

      setCategories(catRes.data || []);
      setAccounts((accRes.data || []).filter((a) => a.type !== "investment"));
      setTrips(tripRes.data || []);
    } catch (err) {
      console.error("Failed to load form data", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isEdit && editData) {
      setForm({
        amount: editData.amount,
        description: editData.description,
        category: editData.category,
        subcategory: editData.subcategory || "",
        accountId:
          typeof editData.accountId === "object"
            ? editData.accountId._id
            : editData.accountId,
        date: dayjs(editData.date).format("YYYY-MM-DD"),
        tripId: editData.tripId
          ? typeof editData.tripId === "object"
            ? editData.tripId._id
            : editData.tripId
          : "",
      });
    } else {
      resetForm();
    }
  }, [editData]);

  const resetForm = useCallback(() => {
    setForm(defaultForm);
    setErrors({});
    setBudgetWarning(null);
  }, []);

  const validate = (data) => {
    const errs = {};
    if (!data.amount) errs.amount = "Amount is required";
    if (!data.description) errs.description = "Description is required";
    if (!data.category) errs.category = "Category is required";
    if (!data.accountId) errs.accountId = "Account is required";
    return errs;
  };

  const checkBudgetStatus = async (data) => {
    try {
      const res = await api.get("/budgets/check", {
        params: {
          category: data.category,
          subcategory: data.subcategory || "",
          amount: data.amount,
          date: data.date,
        },
      });

      if (["overBudget", "nearLimit"].includes(res.data.status)) {
        setBudgetWarning(res.data);
      } else {
        setBudgetWarning(null);
      }
    } catch (err) {
      console.error("Failed to check budget", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = {
      ...form,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    };

    setForm(updatedForm);

    if (name === "date") {
      const selectedDate = dayjs(value);
      const matched = trips.find((tr) =>
        selectedDate.isBetween(
          dayjs(tr.startDate).subtract(1, "day"),
          dayjs(tr.endDate).add(1, "day"),
          null,
          "[]"
        )
      );
      setForm((f) => ({ ...f, tripId: matched?._id || "" }));
    }

    if (
      updatedForm.category &&
      updatedForm.amount &&
      !isNaN(updatedForm.amount)
    ) {
      checkBudgetStatus(updatedForm);
    } else {
      setBudgetWarning(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await api.put(`/expenses/${editData._id}`, form);
      } else {
        await api.post("/expenses", form);
      }

      onSuccess?.();
      resetForm();
      onClose?.();
    } catch (err) {
      console.error("Expense submission failed", err);
      setErrors({
        server:
          err.response?.data?.message || "Something went wrong. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = useMemo(
    () => categories.find((c) => c.name === form.category),
    [categories, form.category]
  );

  const subcategories = currentCategory?.subcategories || [];

  const accountBalance = useMemo(() => {
    const acc = accounts.find((a) => a._id === form.accountId);
    return acc ? acc.balance.toFixed(2) : null;
  }, [accounts, form.accountId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative max-h-screen overflow-y-auto">
        <button
          onClick={() => {
            onClose?.();
            resetForm();
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Expense" : "Add New Expense"}
        </h2>

        {errors.server && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {errors.server}
          </div>
        )}

        {budgetWarning && (
          <div
            className={`px-4 py-3 mb-4 rounded text-sm ${
              budgetWarning.status === "overBudget"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {budgetWarning.status === "overBudget"
              ? `⚠️ This expense will exceed your budget by ₹${budgetWarning.overBy.toFixed(
                  2
                )}`
              : `⚠️ You’re nearing your budget limit. ₹${budgetWarning.remaining.toFixed(
                  2
                )} remaining.`}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block mb-1 font-medium text-sm">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              disabled={loading}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium text-sm">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Category / Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm">
                Category
                {form.category && (
                  <span className="mt-1 text-xs text-gray-500 italic">
                    {" - "} Type: {currentCategory?.type || "N/A"}
                  </span>
                )}
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={loading}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Select --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                disabled={loading || subcategories.length === 0}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Optional --</option>
                {subcategories.map((sub, i) => (
                  <option key={i} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block mb-1 font-medium text-sm">
              Account
              {accountBalance && (
                <span className="mt-1 text-xs text-gray-500 italic">
                  {" - "}Balance: {accountBalance}
                </span>
              )}
            </label>
            <select
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              disabled={loading}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select --</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="text-red-500 text-sm">{errors.accountId}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 font-medium text-sm">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              disabled={loading}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Trip */}
          <div>
            <label className="block mb-1 font-medium text-sm">
              Trip (optional)
            </label>
            <select
              name="tripId"
              value={form.tripId || ""}
              onChange={handleChange}
              disabled={loading}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Not linked --</option>
              {trips.map((tr) => (
                <option key={tr._id} value={tr._id}>
                  {tr.title} ({formatDate(tr.startDate)} to{" "}
                  {formatDate(tr.endDate)})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose?.();
                resetForm();
              }}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white flex items-center justify-center gap-2 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "🚀 Saving..." : isEdit ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
