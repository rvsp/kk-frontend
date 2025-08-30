import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Report = () => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  const [reportType, setReportType] = useState("expense"); // expense | budget

  useEffect(() => {
    fetchForFilters();
  }, []);

  const fetchForFilters = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        api.get("/accounts"),
        api.get("/categories"),
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch filter data", err);
    }
  };

  const handleDownload = async () => {
    setError("");
    try {
      setLoading(true);

      let url = "";
      let params = { month, year };
      let fileName = "";
      if (reportType === "expense") {
        url = "/reports/monthly";
        params = {
          ...params,
          accountId: selectedAccount,
          categoryId: selectedCategory,
          format: "excel",
        };
        fileName = `Monthly_Expense_Report_${month}_${year}.xlsx`;
      } else if (reportType === "budget") {
        url = "/reports/budget-summary";
        fileName = `Budget_Summary_Report_${month}_${year}.xlsx`;
      } else if (reportType === "transactions") {
        url = "/reports/transactions";
        fileName = `Account_Transaction_Report_${month}_${year}.xlsx`;
      } else if (reportType === "milk") {
        url = "/reports/milk-summary";
        fileName = `Milk_Monthly_Report_${month}_${year}.xlsx`;
      }

      const res = await api.get(url, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlBlob;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error("Download failed:", err);
      const status = err.response?.status;
      if (status === 404) setError("No data found for the selected period.");
      else setError("Failed to generate report. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedAccount("");
    setSelectedCategory("");
    setMonth(new Date().getMonth() + 1);
    setYear(currentYear);
    setReportType("expense");
  };

  const isFilterDefault =
    selectedAccount === "" &&
    selectedCategory === "" &&
    reportType === "expense" &&
    month === new Date().getMonth() + 1 &&
    year === new Date().getFullYear();

  return (
    <div className="bg-white shadow rounded-xl p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">📊 Report Export</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Report Type</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="expense">Expense Report</option>
            <option value="budget">Budget Summary</option>
            <option value="transactions">Account Transactions</option>
            {/* <option value="milk">Milk Report</option> */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Month</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en-IN", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Year</label>
          <select
            className="mt-1 w-full border rounded px-3 py-2"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {reportType === "expense" && (
          <>
            <div>
              <label className="block text-sm font-medium">Account</label>
              <select
                className="mt-1 w-full border rounded px-3 py-2"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <option value="">All</option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full border rounded px-3 py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading ? "Generating..." : "Download Excel"}
        </button>
        <button
          onClick={handleResetFilters}
          disabled={isFilterDefault}
          className="bg-gray-300 text-black px-6 py-2 rounded shadow hover:bg-gray-400 transition"
        >
          Reset Filters
        </button>
      </div>
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
    </div>
  );
};

export default Report;
