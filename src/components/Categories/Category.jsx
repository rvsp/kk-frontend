import React, { useEffect, useState } from "react";
import LoadingSpinner from "../Common/LoadingSpinner";
import api from "../../services/api";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.subcategories?.some((sub) =>
        sub.name?.toLowerCase().includes(search.toLowerCase())
      )
  );

  const grouped = filtered.reduce(
    (acc, cat) => {
      const type = cat.type === "income" ? "income" : "expense";
      acc[type].push(cat);
      return acc;
    },
    { income: [], expense: [] }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl space-y-6">
      <h2 className="text-xl font-semibold mb-4">
        Categories{" "}
        <span>
          (
          {categories.length > 0
            ? categories.length
            : "No categories available"}
          )
        </span>
      </h2>

      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filtered.length === 0 ? (
        <div className="text-gray-500">No categories found.</div>
      ) : (
        <>
          {/* Expense Categories */}
          {grouped.expense.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-red-600 mb-2">
                Expense Categories
              </h3>
              {grouped.expense.map((cat) => (
                <div key={cat._id} className="border rounded-md mb-2">
                  <details className="group">
                    <summary className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition">
                      {cat.name}{" "}
                      <span>
                        {cat.subcategories.length > 0
                          ? `(${cat.subcategories.length})`
                          : "(No subcategories)"}
                      </span>
                    </summary>

                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <ul className="px-6 py-3 bg-white divide-y">
                        {cat.subcategories.map((sub, index) => (
                          <li
                            key={index}
                            className="py-1 text-sm text-gray-700"
                          >
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-6 py-3 text-gray-500 text-sm">
                        No subcategories
                      </div>
                    )}
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Income Categories */}
          {grouped.income.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-600 mb-2">
                Income Categories
              </h3>
              {grouped.income.map((cat) => (
                <div key={cat._id} className="border rounded-md mb-2">
                  <details className="group">
                    <summary className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition">
                      {cat.name}{" "}
                      <span>
                        {cat.subcategories.length > 0
                          ? `(${cat.subcategories.length})`
                          : "(No subcategories)"}
                      </span>
                    </summary>

                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <ul className="px-6 py-3 bg-white divide-y">
                        {cat.subcategories.map((sub, index) => (
                          <li
                            key={index}
                            className="py-1 text-sm text-gray-700"
                          >
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-6 py-3 text-gray-500 text-sm">
                        No subcategories
                      </div>
                    )}
                  </details>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryList;
