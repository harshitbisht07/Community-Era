import React from "react";

const StatusPill = ({ status }) => {
  const styles = {
    open: "bg-red-50 text-red-700 ring-red-600/10",
    "in-progress": "bg-amber-50 text-amber-700 ring-amber-600/10",
    resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    closed: "bg-gray-50 text-gray-600 ring-gray-500/10",
  };

  const labels = {
    open: "Pending",
    "in-progress": "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] || styles.closed
      } uppercase tracking-wider`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusPill;
