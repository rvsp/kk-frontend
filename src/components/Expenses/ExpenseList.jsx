import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import ExpenseForm from "./ExpenseForm";
import LoadingSpinner from "../Common/LoadingSpinner";
import {
  formatCurrency,
  formatDate,
  PAGINATION_VALUES,
} from "../../utils/helpers";
import { useAccessControl } from "../../utils/useAccessControl";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// ✅ Debounce hook to avoid multiple rapid API calls
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ExpenseList = () => {
  const { isReadOnly } = useAccessControl();

  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    categoryId: "",
    accountId: "",
    startDate: "",
    endDate: "",
    tripId: "",
  });
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [searchText, setSearchText] = useState("");

  const debouncedSearch = useDebounce(searchText, 500); // ✅ Debounced search
  const totalPages = Math.ceil(totalCount / perPage);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  // ✅ Fetch helper (memoized)
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * perPage,
        limit: perPage,
        ...filters,
        search: debouncedSearch.trim(),
      };
      const res = await api.get("/expenses", { params });
      setExpenses(res.data.expenses);
      setTotalCount(res.data.totalCount);
    } catch {
      console.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
      setFirstLoad(false);
    }
  }, [page, perPage, filters, debouncedSearch]);

  // ✅ Initial data
  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [catRes, accRes, tripRes] = await Promise.all([
          api.get("/categories"),
          api.get("/accounts"),
          api.get("/trips"),
        ]);
        setCategories(catRes.data.filter((t) => t.type !== "income"));
        setAccounts(accRes.data.filter((t) => t.type !== "investment"));
        setTrips(tripRes.data);
      } catch {
        console.error("Failed to load initial data");
      }
    };
    loadInitial();
  }, []);

  // ✅ Fetch on dependency change
  useEffect(() => {
    if (
      firstLoad ||
      debouncedSearch.length === 0 ||
      debouncedSearch.length >= 2
    ) {
      fetchExpenses();
    }
  }, [fetchExpenses, debouncedSearch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    }
  };

  const clearFilters = () => {
    setFilters({
      categoryId: "",
      accountId: "",
      startDate: "",
      endDate: "",
      tripId: "",
    });
    setPage(1);
    setSearchText("");
    setShowFilters(false);
  };

  const handleExpenseAdded = () => {
    setPage(1);
    fetchExpenses();
    setShowAddExpense(false);
    setEditingExpense(null);
  };

  const getCategoryColor = (categoryName) => {
    const cat = categories.find((c) => c.name === categoryName);
    return cat?.color || "#e5e7eb";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-0">
        <h1 className="text-xl font-bold">Expenses</h1>
        <div className="flex gap-3 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm px-3 py-1.5 flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Filters{" "}
            {activeFilters > 0 && (
              <span className="ml-2 text-xs text-blue-600">
                ({activeFilters})
              </span>
            )}
          </button>
          {!isReadOnly && (
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn btn-primary btn-sm flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Expense
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by description..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
          className="form-input w-full sm:w-64 text-sm"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card mb-4">
          <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="form-label">Category</label>
              <select
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters({ ...filters, categoryId: e.target.value })
                }
                className="form-select"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Account */}
            <div>
              <label className="form-label">Account</label>
              <select
                value={filters.accountId}
                onChange={(e) =>
                  setFilters({ ...filters, accountId: e.target.value })
                }
                className="form-select"
              >
                <option value="">All</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Trip */}
            {/* <div>
              <label className="form-label">Trip</label>
              <select
                value={filters.tripId}
                onChange={(e) =>
                  setFilters({ ...filters, tripId: e.target.value })
                }
                className="form-select"
              >
                <option value="">All</option>
                {trips.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div> */}
            {/* Dates */}
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                onClick={clearFilters}
                className="btn btn-sm btn-secondary mt-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2 text-sm">
        <div>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(parseInt(e.target.value));
              setPage(1);
            }}
            className="form-select text-sm px-3 py-1.5"
          >
            {PAGINATION_VALUES.map((n) => (
              <option key={n} value={n}>
                Show {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          Page {page} of {totalPages}
          <button
            className="btn btn-sm ml-2 bg-red-500 text-white"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            className="btn btn-sm ml-1 bg-red-500 text-white"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Expense List */}
      <div className="card">
        <div className="card-body divide-y divide-gray-200">
          {loading && firstLoad ? (
            <div className="p-4 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : !loading && expenses.length === 0 ? (
            <div className="py-6 text-center text-red-400 italic">
              No expenses found
            </div>
          ) : (
            expenses.map((exp) => (
              <div
                key={exp._id}
                className="py-4 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2"
              >
                <div>
                  <div className="font-bold text-base text-gray-800">
                    {exp.description}{" "}
                    <span className="text-sm font-normal text-gray-500 italic">
                      ({exp.accountId?.name} - {exp.type})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                    <span
                      className="rounded px-2 py-0.5 text-white text-sm"
                      style={{
                        backgroundColor: getCategoryColor(exp.category),
                      }}
                    >
                      {exp.category}
                    </span>
                    {exp.subcategory && (
                      <span className="bg-gray-100 rounded px-2 py-0.5">
                        {exp.subcategory}
                      </span>
                    )}

                    <span className="text-gray-400">
                      {formatDate(exp.date)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold text-lg">
                    {formatCurrency(exp.amount)}
                  </div>
                  {!isReadOnly && (
                    <div className="text-xs text-gray-400 flex gap-3 mt-2 justify-end">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        title="Edit"
                        className="hover:text-blue-600 transition"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        title="Delete"
                        className="hover:text-red-600 transition"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Total */}
      {expenses.length > 0 && (
        <div className="mt-6 card">
          <div className="card-body flex justify-between items-center">
            <span className="text-gray-900 font-medium text-lg">
              Total ({expenses.length} item{expenses.length > 1 ? "s" : ""})
            </span>
            <span className="text-2xl font-bold text-danger-600">
              {formatCurrency(
                expenses.reduce((sum, expense) => sum + expense.amount, 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* Modal */}
      {(showAddExpense || editingExpense) && (
        <div className="modal">
          <ExpenseForm
            onClose={() => {
              setShowAddExpense(false);
              setEditingExpense(null);
            }}
            onSuccess={handleExpenseAdded}
            editData={editingExpense}
          />
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
