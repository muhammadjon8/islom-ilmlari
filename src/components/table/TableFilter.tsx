import React from "react";
import { Search } from "lucide-react";

interface TableFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TableFilter: React.FC<TableFilterProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
}) => (
  <div className="flex justify-start mb-3">
    <div className="relative w-60">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border border-gray-300 rounded pl-10 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

export default TableFilter;
