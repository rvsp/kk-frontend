// components/Trips/TripReport.jsx
import React, { useState } from "react";
import api from "../../services/api";
import { PrinterIcon } from "@heroicons/react/24/outline";

const TripReport = ({ trip }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${trip._id}/report`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${trip.title}_Trip_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download trip report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="p-2 rounded hover:bg-gray-100"
      title="Download Trip Report"
    >
      <PrinterIcon className="h-5 w-5 text-blue-600" />
    </button>
  );
};

export default TripReport;
