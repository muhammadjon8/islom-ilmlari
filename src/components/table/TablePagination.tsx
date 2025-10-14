import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      pages.push(1);
      if (start > 2) pages.push("...");

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-end items-center gap-2 mt-4 select-none">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
      >
        <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border border-gray-200 rounded ${
              currentPage === page
                ? "bg-indigo-500 text-white border-indigo-500"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">
            {page}
          </span>
        )
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default TablePagination;
