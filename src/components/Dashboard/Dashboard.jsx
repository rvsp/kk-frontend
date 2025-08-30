import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";
import ExpenseForm from "../Expenses/ExpenseForm";
import BudgetSummary from "../Budget/BudgetSummary";
// import TripSummary from "../Trips/TripSummary";
import AccountBalancesCard from "../Accounts/AccountBalancesCard";
import AccountTransactionRecent from "../Accounts/AccountTransactionRecent";
import ExpenseSummaryCard from "../Expenses/ExpenseSummaryCard";
import LoadingSpinner from "../Common/LoadingSpinner";
import AccountTransferForm from "../Accounts/AccountTransferForm";
import { useAccessControl } from "../../utils/useAccessControl";
import LoginAttempts from "../../pages/LoginAttempts";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  AdjustmentsVerticalIcon,
  CurrencyRupeeIcon,
  WalletIcon,
  ScaleIcon,
} from "@heroicons/react/24/solid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import SalaryEntryForm from "../Accounts/SalaryEntryForm";

const Dashboard = () => {
  const { isReadOnly } = useAccessControl();
  const { togglePrivacyMode, privacyMode } = useAuth();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddSalary, setShowAddSalary] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalSalary: 0,
    totalExpenses: 0,
    netThisMonth: 0,
    carryForward: 0,
    investment: 0,
    carryForwardFromLastMonth: 0,
    monthlyChart: [],
  });

  const cards = [
    {
      label: "Total Balance",
      value: formatCurrency(summary.netThisMonth || 0),
      icon: WalletIcon,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Total Salary",
      value: formatCurrency(summary.totalSalary || 0),
      icon: ArrowTrendingUpIcon,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(summary.totalExpenses || 0),
      icon: ArrowTrendingDownIcon,
      color: "bg-red-100 text-red-800",
    },
    {
      label: "Investment",
      value: formatCurrency(summary.investment || 0),
      icon: ArrowTrendingUpIcon,
      color: "bg-amber-100 text-amber-800",
    },
    // {
    //   label: "Net This Month Balance",
    //   value: formatCurrency(summary.netThisMonth || 0),
    //   icon: ScaleIcon,
    //   color: "bg-indigo-100 text-indigo-800",
    // },
    {
      label: "Carry Forward",
      value: formatCurrency(summary.carryForward || 0),
      icon: BanknotesIcon,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "Carry Forward From Last Month",
      value: formatCurrency(summary.carryForwardFromLastMonth || 0),
      icon: AdjustmentsVerticalIcon,
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard/summary", {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, [selectedMonth, selectedYear]);

  const handleExpenseAdded = () => {
    setShowAddExpense(false);
    setShowTransferModal(false);
    setShowAddSalary(false);
    fetchDashboardSummary();
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = today.getFullYear() - i;
    return { value: year, label: year };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard Summary
        </h2>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Privacy toggle */}
          <button
            onClick={togglePrivacyMode}
            className="px-3 py-1.5 rounded bg-gray-200 text-sm font-medium"
          >
            {privacyMode ? (
              <>
                Privacy <span className="text-green-600 font-semibold">On</span>
              </>
            ) : (
              <>
                Privacy <span className="text-red-700 font-semibold">Off</span>
              </>
            )}
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            {yearOptions.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
          {!isReadOnly && (
            <>
              <button
                onClick={() => setShowAddExpense(true)}
                disabled={isReadOnly}
                className={`btn inline-flex items-center px-3 py-1.5 text-sm rounded ${
                  !isReadOnly
                    ? "btn-primary bg-indigo-600 shadow"
                    : "btn-secondary"
                }`}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Expense
              </button>
              <button
                className={`btn rounded inline-flex items-center px-3 py-1.5 ${
                  !isReadOnly ? "btn-danger " : "btn btn-secondary "
                }`}
                disabled={isReadOnly}
                onClick={() => setShowTransferModal(true)}
              >
                <BanknotesIcon className="h-4 w-4 mr-2" />
                Transfer Funds
              </button>
              <button
                disabled={isReadOnly}
                className={`btn inline-flex items-center px-3 py-1.5 ${
                  !isReadOnly ? "btn-success" : "btn-secondary"
                }`}
                onClick={() => setShowAddSalary(true)}
              >
                <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                Salary
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center p-4 bg-white rounded-2xl shadow-md"
          >
            <div className={`p-3 rounded-full ${card.color} mr-4`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className="text-lg font-semibold text-gray-900">
                {privacyMode ? "*****" : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Account Balances Table */}
      <AccountBalancesCard />

      {/* Expense category grouped for summary */}
      <ExpenseSummaryCard month={selectedMonth} year={selectedYear} />

      <div className="mt-6">
        <BudgetSummary month={selectedMonth} year={selectedYear} />
      </div>

      {/* Trip expense vs Trip budget */}
      {/* <div className="mt-6">
          <TripSummary month={selectedMonth} year={selectedYear} />
        </div> */}

      {/* Recent Transactions */}
      <AccountTransactionRecent month={selectedMonth} year={selectedYear} />

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-md p-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Last 3 Months Overview
        </h3>
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : summary.monthlyChart?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.monthlyChart}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="salary" fill="#10b981" name="Salary" />
              <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
              <Bar dataKey="investment" fill="#c744efff" name="Investment" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-sm text-gray-500 py-8">
            No chart data for the last 3 months.
          </div>
        )}
      </div>

      {/* display recent login attempts */}
      {!isReadOnly && (
        <div className="mt-6">
          <LoginAttempts />
        </div>
      )}

      {/* Modals */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ExpenseForm
              onSuccess={handleExpenseAdded}
              onClose={() => setShowAddExpense(false)}
            />
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AccountTransferForm
              onSuccess={handleExpenseAdded}
              onCancel={() => setShowTransferModal(false)}
            />
          </div>
        </div>
      )}

      {showAddSalary && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <SalaryEntryForm
              onSuccess={handleExpenseAdded}
              onClose={() => setShowAddSalary(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
