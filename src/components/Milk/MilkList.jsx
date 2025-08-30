import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import { MONTHS, PAGINATION_VALUES, yearOptions } from "../../utils/helpers";
import { useAccessControl } from "../../utils/useAccessControl";
import {
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

const MilkTracker = () => {
  const { isReadOnly } = useAccessControl();
  const today = dayjs();
  const defaultRate = 53;

  const [milkEntries, setMilkEntries] = useState([]);
  const [settledMonths, setSettledMonths] = useState([]);
  const [filters, setFilters] = useState({
    month: today.month(),
    year: today.year(),
    limit: 10,
    page: 1,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    date: today.format("YYYY-MM-DD"),
    quantity: 1,
    rate: defaultRate,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / filters.limit));

  /** Fetch both entries + settled months in parallel */
  const fetchData = useCallback(async () => {
    setIsFetching(true);
    setError("");
    setMessage("");
    try {
      const [entriesRes, settledRes] = await Promise.all([
        api.get("/milk", { params: filters }),
        api.get("/milk/settlements"),
      ]);
      setMilkEntries(entriesRes.data.entries);
      setTotalCount(entriesRes.data.totalCount);
      setSettledMonths(settledRes.data.settledMonths);
    } catch (err) {
      console.error("Error fetching milk data", err);
      setError("Failed to fetch milk data. Please try again.");
    } finally {
      setIsFetching(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Submit new milk entry */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const alreadyExists = milkEntries.some(
      (entry) => entry.date.slice(0, 10) === form.date
    );
    if (alreadyExists && !window.confirm("Entry exists. Add another?")) {
      setIsSubmitting(false);
      return;
    }
    try {
      const res = await api.post("/milk", form);
      // Optimistically update local state without full refetch
      setMilkEntries((prev) => [res.data, ...prev]);
      setTotalCount((prev) => prev + 1);
      setForm({
        date: today.format("YYYY-MM-DD"),
        quantity: 1,
        rate: defaultRate,
      });
      setMessage("Entry added.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to add entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Delete entry without refetching all */
  const handleDeleteEntry = async (id) => {
    try {
      await api.delete(`/milk/${id}`);
      setMilkEntries((prev) => prev.filter((entry) => entry._id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      console.error("Delete failed", err);
      setError(err.response?.data?.message || "Failed to delete entry.");
    }
  };

  /** Settle milk for current month */
  const handleSettleMilk = async () => {
    setMessage("");
    setError("");
    try {
      const res = await api.post("/milk/settle", {
        month: filters.month + 1,
        year: filters.year,
      });
      fetchData(); // need fresh state for settlements
      setMessage(`✅ Milk settled for ₹${res.data.settlement.totalAmount}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to settle");
    }
  };

  const isCurrentMonthSettled = useMemo(
    () =>
      settledMonths.some(
        (m) => m.year === filters.year && m.month === filters.month + 1
      ),
    [settledMonths, filters]
  );

  const totalQuantity = useMemo(
    () => milkEntries.reduce((sum, e) => sum + e.quantity, 0),
    [milkEntries]
  );
  const totalCost = useMemo(
    () => milkEntries.reduce((sum, e) => sum + e.quantity * e.rate, 0),
    [milkEntries]
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      <h2 className="text-2xl font-bold">🥛 Milk Delivery Tracker</h2>

      {/* Status Message */}
      <div className="flex items-center gap-2">
        {isCurrentMonthSettled ? (
          <>
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">
              Settled for {MONTHS[filters.month]} {filters.year}
            </span>
          </>
        ) : (
          <>
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-600 font-medium">
              Not settled for {MONTHS[filters.month]} {filters.year}
            </span>
          </>
        )}
      </div>

      {/* Form */}
      {!isReadOnly && (
        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border rounded p-2"
            required
          />
          <input
            type="number"
            step="0.1"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: parseFloat(e.target.value) })
            }
            className="w-full border rounded p-2"
            required
          />
          <input
            type="number"
            value={form.rate}
            onChange={(e) =>
              setForm({ ...form, rate: parseFloat(e.target.value) })
            }
            className="w-full border rounded p-2"
            required
          />
          <button
            disabled={isReadOnly || isSubmitting}
            type="submit"
            className={`btn w-full rounded p-2 ${
              isSubmitting ? "btn-secondary" : "btn-primary"
            }`}
          >
            {isSubmitting ? "🕒 Adding..." : "💾 Add Entry"}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.month}
          onChange={(e) =>
            setFilters((f) => ({ ...f, month: +e.target.value, page: 1 }))
          }
          className="border px-3 py-2 rounded w-28"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={filters.year}
          onChange={(e) =>
            setFilters((f) => ({ ...f, year: +e.target.value, page: 1 }))
          }
          className="border px-3 py-2 rounded w-28"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={filters.limit}
          onChange={(e) =>
            setFilters((f) => ({ ...f, limit: +e.target.value, page: 1 }))
          }
          className="border px-3 py-2 rounded w-32"
        >
          {PAGINATION_VALUES.map((v) => (
            <option key={v} value={v}>
              Show {v}
            </option>
          ))}
        </select>
      </div>

      {/* Alerts */}
      {message && <div className="alert-success">{message}</div>}
      {error && <div className="alert-error">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border mt-2 text-sm">
          <thead>
            <tr className="bg-gray-100 font-semibold">
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Quantity (L)</th>
              <th className="border px-2 py-1">Total (₹)</th>
              {!isReadOnly && <th className="border px-2 py-1">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : milkEntries.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No entries found.
                </td>
              </tr>
            ) : (
              milkEntries.map((entry) => (
                <tr key={entry._id}>
                  <td className="border px-2 py-1">
                    {dayjs(entry.date).format("DD MMM YYYY")}
                  </td>
                  <td className="border px-2 py-1">{entry.quantity}</td>
                  <td className="border px-2 py-1">
                    ₹{(entry.quantity * entry.rate).toFixed(2)}
                  </td>
                  {!isReadOnly && (
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        title="Delete entry"
                      >
                        <TrashIcon className="h-5 w-5 text-red-500 hover:text-red-700 inline" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <button
          disabled={filters.page === 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {filters.page} of {totalPages}
        </span>
        <button
          disabled={filters.page >= totalPages}
          onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Totals */}
      <div className="text-base font-medium space-y-1">
        <p>Total Quantity: {totalQuantity.toFixed(2)} L</p>
        <p>Total Cost: ₹{totalCost.toFixed(2)}</p>
      </div>

      {/* Settle Button */}
      <button
        onClick={handleSettleMilk}
        disabled={
          isReadOnly ||
          isFetching ||
          isCurrentMonthSettled ||
          milkEntries.length === 0
        }
        className={`mt-4 btn rounded px-4 py-2 ${
          isReadOnly ||
          isFetching ||
          isCurrentMonthSettled ||
          milkEntries.length === 0
            ? "opacity-50 cursor-not-allowed btn-secondary"
            : "btn-success"
        }`}
      >
        {isFetching
          ? "Settling..."
          : isCurrentMonthSettled
          ? "Already Settled"
          : milkEntries.length === 0
          ? "No Entries"
          : "Settle Now"}
      </button>
    </div>
  );
};

export default MilkTracker;
