import React from "react";

interface TableFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const TableFilter: React.FC<TableFilterProps> = ({ value, onChange }) => (
  <div className="flex justify-start mb-3">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      className="border border-gray-300 rounded px-3 py-1 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default TableFilter;
