// components/Trips/TripForm.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import dayjs from "dayjs";

const TripForm = ({ trip, onClose, onSaved }) => {
  const isEdit = Boolean(trip);
  const [form, setForm] = useState({
    title: "",
    purpose: "",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
    budget: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setForm({
        title: trip.title || "",
        purpose: trip.purpose || "",
        startDate: dayjs(trip.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(trip.endDate).format("YYYY-MM-DD"),
        budget: trip.budget || "",
        notes: trip.notes || "",
      });
    }
  }, [trip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.startDate || !form.endDate) {
      setError("Title and period are required");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/trips/${trip._id}`, {
          ...form,
          budget: form.budget ? Number(form.budget) : 0,
        });
      } else {
        await api.post("/trips", {
          ...form,
          budget: form.budget ? Number(form.budget) : 0,
        });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white max-w-lg w-full rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Trip" : "Create Trip"}
        </h3>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Purpose</label>
            <input
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Budget (₹)</label>
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripForm;
