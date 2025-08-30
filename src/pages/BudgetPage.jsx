// src/pages/BudgetPage.jsx
import React, { useState } from "react";
import BudgetForm from "../components/Budget/BudgetForm";
import BudgetList from "../components/Budget/BudgetList";
import { useAccessControl } from "../utils/useAccessControl";

const BudgetPage = () => {
  const { isReadOnly } = useAccessControl();
  const [editingBudget, setEditingBudget] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // used to trigger refresh in BudgetList

  const handleBudgetSaved = () => {
    setEditingBudget(null);
    setRefreshKey((prev) => prev + 1); // trigger BudgetList to refresh
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      <h1 className="text-2xl font-bold mb-2">Manage Budgets</h1>
      {!isReadOnly && (
        <BudgetForm
          editingBudget={editingBudget}
          onBudgetSaved={handleBudgetSaved}
          onResetEdit={() => setEditingBudget(null)}
        />
      )}
      <BudgetList onEdit={setEditingBudget} refreshTrigger={refreshKey} />
    </div>
  );
};

export default BudgetPage;
