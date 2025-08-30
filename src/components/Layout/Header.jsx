import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAccessControl } from "../../utils/useAccessControl";

import {
  ChartBarIcon,
  CreditCardIcon,
  UserCircleIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
  DocumentChartBarIcon,
  BanknotesIcon,
  PlusIcon,
  CurrencyRupeeIcon,
  ChartPieIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { path: "/dashboard", label: "Dashboard", Icon: ChartBarIcon },
  { path: "/expenses", label: "Expenses", Icon: CreditCardIcon },
  // { path: "/milk-tracker", label: "Track Milk", Icon: BeakerIcon },
  { path: "/budgets", label: "Budgets", Icon: ChartPieIcon },
  // { path: "/trips", label: "Trip", Icon: TruckIcon },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, household } = useAuth();
  const { isReadOnly } = useAccessControl();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const reportDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target)
      ) {
        setAccountOpen(false);
      }
      if (
        reportDropdownRef.current &&
        !reportDropdownRef.current.contains(e.target)
      ) {
        setReportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavLinkItem = ({ to, label, Icon, onClick }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        onClick={() => {
          setMobileMenuOpen(false);
          onClick?.();
        }}
        className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition ${
          active
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        }`}
      >
        <span className="flex items-center">
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {label}
        </span>
      </Link>
    );
  };

  return (
    <header className="bg-white shadow border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition"
            onClick={() => navigate("/dashboard")}
          >
            💰 Expense Tracker
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-4 items-center">
            {navItems.map(({ path, label, Icon }) => (
              <NavLinkItem key={path} to={path} label={label} Icon={Icon} />
            ))}

            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => {
                  setAccountOpen(!accountOpen);
                  setReportOpen(false);
                  setUserMenuOpen(false);
                }}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith("/account")
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <BanknotesIcon className="h-4 w-4 mr-2" />
                Accounts
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border rounded shadow z-10">
                  {!isReadOnly && (
                    <NavLinkItem
                      to="/account"
                      label="Create Account"
                      Icon={PlusIcon}
                    />
                  )}
                  <NavLinkItem
                    to="/account/transactions"
                    label="Acc Transactions"
                    Icon={CurrencyRupeeIcon}
                  />
                </div>
              )}
            </div>

            {/* Report Dropdown */}
            <div className="relative" ref={reportDropdownRef}>
              <button
                onClick={() => {
                  setReportOpen(!reportOpen);
                  setAccountOpen(false);
                  setUserMenuOpen(false);
                }}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname.startsWith("/reports")
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <DocumentChartBarIcon className="h-4 w-4 mr-2" />
                Reports
              </button>
              {reportOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border rounded shadow z-10">
                  <NavLinkItem
                    to="/reports/monthly"
                    label="Monthly Report"
                    Icon={DocumentChartBarIcon}
                  />
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setAccountOpen(false);
                  setReportOpen(false);
                }}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <UserCircleIcon className="h-5 w-5 mr-2" />
                {user?.name}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-60 bg-white border rounded shadow z-10 p-3 space-y-2 text-sm text-gray-700">
                  <div>
                    <strong>User:</strong> {user?.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {user?.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {user?.role}
                  </div>
                  <div>
                    <strong>Household:</strong> {household?.name}
                  </div>
                  <Link
                    to="/change-password"
                    className="block text-blue-600 hover:text-blue-800"
                  >
                    Change Password
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center text-red-600 hover:text-red-800 mt-2"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Toggle + User Section */}
          <div className="flex items-center space-x-4 md:hidden">
            <div className="flex items-center space-x-1 text-sm text-gray-700">
              <UserCircleIcon className="h-5 w-5 text-gray-500" />
              <div className="flex flex-col leading-tight text-xs">
                <span>{user?.name}</span>
                <span className="text-gray-500">{household?.name}</span>
              </div>
            </div>
            <button
              className="p-2 rounded text-gray-700 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pb-4 space-y-2 border-t pt-2 transition-all">
            {navItems.map(({ path, label, Icon }) => (
              <NavLinkItem key={path} to={path} label={label} Icon={Icon} />
            ))}
            {!isReadOnly && (
              <NavLinkItem
                to="/account"
                label="Create Account"
                Icon={PlusIcon}
              />
            )}
            <NavLinkItem
              to="/account/transactions"
              label="Acc Transactions"
              Icon={CurrencyRupeeIcon}
            />
            <NavLinkItem
              to="/reports/monthly"
              label="Monthly Report"
              Icon={DocumentChartBarIcon}
            />
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
