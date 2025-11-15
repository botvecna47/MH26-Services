import { ReactNode, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const direction = sortDirection === 'asc' ? 1 : -1;
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * direction;
        }
        
        return String(aVal).localeCompare(String(bVal)) * direction;
      })
    : data;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-left ${
                  column.align === 'center'
                    ? 'text-center'
                    : column.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-2 hover:text-foreground transition-colors group w-full justify-start"
                  >
                    <span className="font-medium text-muted-foreground group-hover:text-foreground">
                      {column.label}
                    </span>
                    {sortKey === column.key ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    ) : (
                      <div className="w-4 h-4 opacity-0 group-hover:opacity-50">
                        <ChevronUp className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ) : (
                  <span className="font-medium text-muted-foreground">{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-border last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-muted transition-colors' : ''
              }`}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-4 py-4 ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
