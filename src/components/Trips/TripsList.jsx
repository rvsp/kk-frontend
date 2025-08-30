// components/Trips/TripsList.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import TripForm from "./TripForm";
import TripReport from "./TripReport";
import LoadingSpinner from "../Common/LoadingSpinner";
import { formatCurrency, formatDate } from "../../utils/helpers";
import {
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAccessControl } from "../../utils/useAccessControl";

const TripsList = () => {
  const { isReadOnly } = useAccessControl();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // Modal states
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripExpenses, setTripExpenses] = useState([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get("/trips");
      setTrips(res.data || []);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error(err);
      alert("Failed to delete trip");
    }
  };

  const handlePreviewExpenses = async (trip) => {
    setSelectedTrip(trip);
    setShowExpenseModal(true);
    setLoadingExpenses(true);

    try {
      const res = await api.get(`/expenses`, {
        params: { tripId: trip._id, isViewByTrip: true },
      });
      const fetchedExpenses = res.data.expenses || [];
      setTripExpenses(fetchedExpenses);
      setTotalCount(fetchedExpenses.length);
      setTotalAmount(
        fetchedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      );
    } catch (err) {
      console.error("Failed to fetch trip expenses", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Trips</h3>
        {!isReadOnly && (
          <button
            className="btn btn-primary px-3 py-1.5 text-white rounded flex items-center gap-1"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            <PlusIcon className="h-4 w-4" /> New Trip
          </button>
        )}
      </div>

      {/* Trip List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-4 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-gray-500">No trips found.</div>
        ) : (
          trips.map((t) => (
            <div
              key={t._id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">
                  {t.title} ({t.purpose}){" "}
                </div>
                <div className="text-sm text-gray-500 p-1">
                  {formatDate(t.startDate)} - {formatDate(t.endDate)}
                </div>
                <div className="text-sm text-gray-600">
                  <span>Budget: {t.budget ? `₹${t.budget}` : "-"} / </span>{" "}
                  <span>
                    Spent: {t.spent} {" /  "}
                  </span>
                  <span
                    className={`${
                      t.remaining > 0 ? "text-green-600" : "text-red-600"
                    } font-medium`}
                  >
                    Remaining: ₹{t.remaining >= 0 ? t.remaining : 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handlePreviewExpenses(t)}
                  className="btn btn-sm btn-secondary"
                >
                  View Expenses
                </button>
                {!isReadOnly && (
                  <>
                    <TripReport trip={t} />
                    <button
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        setEditing(t);
                        setShowForm(true);
                      }}
                    >
                      <PencilSquareIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100"
                      onClick={() => handleDelete(t._id)}
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Trip Form */}
      {showForm && (
        <TripForm
          trip={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            fetchTrips();
          }}
        />
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {selectedTrip?.title} - Expenses
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowExpenseModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {loadingExpenses ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              ) : tripExpenses.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {tripExpenses.map((exp) => (
                    <li key={exp._id} className="py-2 flex justify-between">
                      <span>
                        {exp.description} - {formatDate(exp.date)}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(exp.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No expenses for this trip.</p>
              )}
            </div>
            <div className="border-t p-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total Records: <span className="font-medium">{totalCount}</span>{" "}
                | Total Amount:{" "}
                <span className="font-medium text-green-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowExpenseModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsList;
