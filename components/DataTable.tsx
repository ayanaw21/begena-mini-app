"use client";

import React from "react";

interface Column {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[]; // Each row is an object with keys matching columns
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 p-2">
      <table className="w-full text-left text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2 bg-gray-900 text-gray-200 font-semibold"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center text-gray-400 py-4"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={index}
                className={`border-t border-gray-700 ${
                  index % 2 === 0 ? "bg-gray-800" : "bg-gray-700/50"
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
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
