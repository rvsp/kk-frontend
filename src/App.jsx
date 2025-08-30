import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import ExpenseList from "./components/Expenses/ExpenseList";
// import CategoryList from "./components/Categories/Category";
// import MilkList from "./components/Milk/MilkList";
import Report from "./components/Reports/Report";
import AccountList from "./components/Accounts/AccountList";
import AccountTransactionList from "./components/Accounts/AccountTransactionList";

import ProtectedRoute from "./components/Common/ProtectedRoute";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import Header from "./components/Layout/Header";
import BudgetPage from "./pages/BudgetPage";
// import LoginAttempts from "./pages/LoginAttempts";
import ChangePassword from "./pages/ChangePassword";
// import TripsList from "./components/Trips/TripsList";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Show header only when logged in */}
        {user && <Header />}

        <main className={`${user ? "pt-0" : ""}`}>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
            />
            {/* <Route
              path="/register"
              element={
                !user ? <Register /> : <Navigate to="/dashboard" replace />
              }
            /> */}

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <ExpenseList />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/milk-tracker"
              element={
                <ProtectedRoute>
                  <MilkList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <TripsList />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/transactions"
              element={
                <ProtectedRoute>
                  <AccountTransactionList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <BudgetPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/monthly"
              element={
                <ProtectedRoute>
                  <Report />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            {/* Default redirect based on auth */}
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
            />

            {/* Catch-all 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
