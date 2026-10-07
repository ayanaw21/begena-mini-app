"use client";

import React from "react";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]; // Each row is an object with keys matching columns
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="bg-surface w-full overflow-x-auto rounded-xl border border-white/5">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-white/5 text-xs tracking-wider uppercase">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 font-medium whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-muted-foreground px-4 py-10 text-center"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 whitespace-nowrap">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
