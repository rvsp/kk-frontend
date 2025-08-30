import React from "react";

const ProgressBar = ({ value, max, label, color }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  let barColor = color || "bg-green-500";
  if (!color) {
    if (percentage >= 100) barColor = "bg-red-500";
    else if (percentage >= 80) barColor = "bg-yellow-500";
  }

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`${barColor} h-3 transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
