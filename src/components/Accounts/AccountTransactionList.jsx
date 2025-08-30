import React, { useEffect, useState, useCallback } from "react";
import LoadingSpinner from "../Common/LoadingSpinner";
import api from "../../services/api";
import {
  formatCurrency,
  MONTHS,
  PAGINATION_VALUES,
  formatDate,
} from "../../utils/helpers";
import { BanknotesIcon } from "@heroicons/react/24/outline";

const typeColors = {
  salary: "bg-green-100 text-green-800",
  transfer: "bg-blue-100 text-blue-800",
  investment: "bg-yellow-100 text-yellow-800",
  income: "bg-emerald-100 text-emerald-800",
  expense: "bg-red-100 text-red-800",
  adjustment: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

const typeOptions = [
  { value: "", label: "All" },
  { value: "salary", label: "Salary" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "investment", label: "Investment" },
  { value: "transfer", label: "Transfer" },
  { value: "adjustment", label: "Adjustment" },
];

const date = new Date();
const currentYear = date.getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

const AccountTransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    type: "",
    month: date.getMonth(),
    year: currentYear,
    limit: 10,
    page: 1,
  });

  const totalPages = Math.ceil(total / filters.limit);

  const buildQueryParams = useCallback(() => {
    return {
      ...(filters.type && { type: filters.type }),
      ...(filters.month !== "" && { month: filters.month }),
      ...(filters.year !== "" && { year: filters.year }),
      limit: filters.limit,
      page: filters.page,
    };
  }, [filters]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/account-transactions", {
        params: buildQueryParams(),
      });

      let fetched = res.data.transactions || [];

      setTransactions(fetched);
      setTotal(fetched.length ? res.data.total : 0);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, filters.type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleLimitChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(e.target.value, 10),
      page: 1,
    }));
  };

  const handlePageChange = (direction) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(totalPages, prev.page + direction)),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Account Transactions
          </h2>
          <p className="text-sm text-gray-500">
            Filter by type, month, or year to narrow down results.
          </p>
          <p className="text-sm text-gray-700 mt-1 font-medium">
            Total Records: {total}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            className="border rounded px-3 py-2 text-sm text-gray-700"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value, page: 1 }))
            }
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm text-gray-700"
            value={filters.month}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                month: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All Months</option>
            {MONTHS.map((month, idx) => (
              <option key={idx} value={idx}>
                {month}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm text-gray-700"
            value={filters.year}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, year: e.target.value, page: 1 }))
            }
          >
            <option value="">All Years</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm text-gray-700"
            value={filters.limit}
            onChange={handleLimitChange}
          >
            {PAGINATION_VALUES.map((lim) => (
              <option key={lim} value={lim}>
                Show {lim}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <BanknotesIcon className="mx-auto w-10 h-10 text-gray-300 mb-2" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {tx.date ? formatDate(tx.date) : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          typeColors[tx.type] || typeColors.other
                        }`}
                      >
                        {tx.type
                          ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
                          : "Other"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {tx.fromAccountId?.name?.toUpperCase() ||
                        tx.accountId?.name?.toUpperCase() ||
                        "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {tx?.toAccountId
                        ? `${tx.toAccountId.name.toUpperCase()} (${
                            tx.toAccountId.type
                          })`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {tx.note
                        ? tx.note.charAt(0).toUpperCase() + tx.note.slice(1)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
            onClick={() => handlePageChange(-1)}
            disabled={filters.page <= 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {filters.page} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
            onClick={() => handlePageChange(1)}
            disabled={filters.page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountTransactionList;
