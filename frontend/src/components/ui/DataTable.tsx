import React from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortOrder,
  onSort,
  onRowClick,
  emptyMessage = 'No matching records found in the national directory.',
  isLoading = false,
  className = ''
}: DataTableProps<T>) {
  return (
    <div className={`command-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider select-none">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSort && onSort(col.key)}
                    style={{ width: col.width }}
                    className={`p-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.sortable ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition' : ''
                    }`}
                  >
                    <div className={`inline-flex items-center space-x-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#0d52ce]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#0d52ce]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-${i}`} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={`skel-td-${j}`} className="p-3.5">
                      <div className="h-4 bg-slate-100 rounded w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-blue-50/30' : ''
                  } ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`p-3.5 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item, idx) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500 italic">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Showing <strong>{data.length}</strong> record{data.length === 1 ? '' : 's'}
        </span>
        <span className="text-[10px] text-slate-400">
          MoSPI Data Infrastructure Grid
        </span>
      </div>
    </div>
  );
}
