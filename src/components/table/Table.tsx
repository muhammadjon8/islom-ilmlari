// src/components/Table/Table.tsx
import { useState, useMemo } from "react";
import TablePagination from "./TablePagination";
import TableFilter from "./TableFilter";
import type { TableProps } from "../../types/table.type";

function Table<T>({
  columns,
  data,
  actions,
  filterKey,
  itemsPerPage = 5,
}: TableProps<T>) {
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!filterKey || !filter.trim()) return data;
    return data.filter((row) =>
      String(row[filterKey]).toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, data, filterKey]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {filterKey && <TableFilter value={filter} onChange={setFilter} />}

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left">
            {columns.map((col) => (
              <th key={String(col.key)} className="p-2 border-b font-semibold">
                {col.label}
              </th>
            ))}
            {actions && <th className="p-2 border-b text-right">Amallar</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="p-2 py-5 border-b border-gray-100 text-sm"
                  >
                    {col.render
                      ? col.render((row as any)[col.key], row)
                      : String((row as any)[col.key])}
                  </td>
                ))}
                {actions && (
                  <td className="p-2 border-b border-gray-100 text-right space-x-2">
                    {actions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => action.onClick(row)}
                        className={`text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                          action.className || "border"
                        }`}
                      >
                        {action.icon ? action.icon : action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-3 text-gray-500"
              >
                Natijalar topilmadi
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-center">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Table;
