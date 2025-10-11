import type { JSX } from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableAction<T> {
  label: string;
  onClick: (row: T) => void;
  className?: string;
  icon?: JSX.Element;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: TableAction<T>[];
  filterKey?: keyof T;
  itemsPerPage?: number;
}
