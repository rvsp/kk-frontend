import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { MONTHS, yearOptions } from "../../utils/helpers";
import { useAccessControl } from "../../utils/useAccessControl";

const now = new Date();
const currentMonth = now.getMonth(); // 0-based
const currentYear = now.getFullYear();

const BudgetForm = ({ editingBudget, onBudgetSaved, onResetEdit }) => {
  const { isReadOnly } = useAccessControl();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    subcategory: "",
    amount: "",
    month: currentMonth,
    year: currentYear,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      const filtered = (res.data || []).filter((cat) => cat.type === "expense");
      setCategories(filtered);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category || "",
        subcategory: editingBudget.subcategory || "",
        amount: editingBudget.amount || "",
        month: editingBudget.month ?? currentMonth,
        year: editingBudget.year ?? currentYear,
      });
    } else {
      handleReset();
    }
  }, [editingBudget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    }));
  };

  const handleReset = () => {
    setFormData({
      category: "",
      subcategory: "",
      amount: "",
      month: currentMonth,
      year: currentYear,
    });
    if (onResetEdit) onResetEdit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        date: new Date(formData.year, formData.month), // set default date for backend
      };

      if (editingBudget?._id) {
        await api.put(`/budgets/${editingBudget._id}`, dataToSend);
        setMessage("✅ Budget Updated!");
      } else {
        await api.post("/budgets", dataToSend);
        setMessage("✅ Budget Created!");
      }
      if (onBudgetSaved) onBudgetSaved();
      handleReset();
    } catch (err) {
      console.error("Failed to save budget:", err);
      setError(`❌ ${err.response?.data?.message}` || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories.find(
    (cat) => cat.name === formData.category
  );
  const subcategories = currentCategory?.subcategories || [];

  return (
    <form onSubmit={handleSubmit} className=" px-2 py-3 mb-3">
      <h2 className="text-lg font-semibold mb-4">
        {editingBudget ? "Edit Budget" : "Create Budget"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <select
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            disabled={!formData.category}
          >
            <option value="">-- Select Subcategory --</option>
            {subcategories.map((sub, idx) => (
              <option key={idx} value={sub.name}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
            min={0}
          />
        </div>

        {/* Month & Year */}
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              {MONTHS.map((month, idx) => (
                <option key={idx} value={idx}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between">
        <button
          title={isReadOnly ? "You have read-only access" : ""}
          disabled={isReadOnly || loading}
          type="submit"
          className={`rounded btn w-fit flex items-center gap-2 ${
            !isReadOnly
              ? "btn-primary hover:bg-blue-700 transition"
              : "btn-secondary"
          }`}
        >
          {loading ? (
            <span className="italic text-sm text-white">🚀 Saving...</span>
          ) : editingBudget ? (
            "Update Budget"
          ) : (
            "Save Budget"
          )}
        </button>
        <button
          type="button"
          disabled={isReadOnly}
          onClick={handleReset}
          className={`"text-sm text-gray-500 border px-3 py-1 rounded" ${
            isReadOnly ? "cursor-not-allowed" : "hover:bg-gray-200"
          }`}
        >
          Reset
        </button>
      </div>

      {/* Messages */}
      <>
        {message && (
          <div className="mb-4 mt-4 rounded-md bg-green-100 text-green-800 px-4 py-2 text-sm">
            {message}
            <button
              onClick={() => setMessage("")}
              className="float-right font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {error && (
          <div className="mb-4 mt-4 rounded-md bg-red-100 text-red-800 px-4 py-2 text-sm">
            {error}
            <button
              onClick={() => setError("")}
              className="float-right font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </>
    </form>
  );
};

export default BudgetForm;
