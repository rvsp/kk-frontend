import React, { useEffect, useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../Common/LoadingSpinner";
import ProgressBar from "../Common/ProgressBar";
import { formatDate } from "../../utils/helpers";

const TripSummary = ({ month, year }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (month !== undefined && year !== undefined) {
      fetchTrips();
    }
  }, [month, year]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get("/trips/summary", {
        params: { month, year },
      });
      setTrips(res.data || []);
    } catch (err) {
      console.error("Error fetching trip summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🧳 Trip Budgets & Expenses
      </h3>
      {trips.length === 0 ? (
        <p className="text-sm text-gray-500">No Trip Budget Found.</p>
      ) : (
        trips.map((trip) => {
          let barColor = null;
          if (trip.spentPercent >= 100) barColor = "bg-red-500";
          else if (trip.percentage >= 80) barColor = "bg-yellow-500";

          return (
            <div key={trip.tripId} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm ">
                  {trip.tripName}- ({formatDate(trip.startDate)} to{" "}
                  {formatDate(trip.endDate)})
                </span>
                <span className="text-sm">{trip.spentPercent} %</span>
              </div>
              <ProgressBar
                value={trip.spent}
                max={trip.budgeted}
                color={barColor}
              />
              <div className="text-xs mt-1 italic">
                Budget: ₹{trip.budgeted.toLocaleString()} | Spent: ₹
                {trip.spent.toLocaleString()} | Remaining: ₹
                {trip.remaining.toLocaleString()}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TripSummary;
