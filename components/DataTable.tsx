"use client";

import Image from "next/image";
import { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps {
  columns: Column[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]; // Each row is an object with keys matching columns
  image?: SiteImage;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, image }) => {
  return (
    <div className="bg-surface relative w-full overflow-hidden rounded-xl border border-white/10 shadow-xl">
      {image ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src={image}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover opacity-15"
          />
          <div className="from-surface/90 via-surface/75 to-surface/90 absolute inset-0 bg-gradient-to-b" />
        </div>
      ) : null}
      <div className="relative z-10 w-full overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b border-white/5 text-xs tracking-wider uppercase">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 font-medium whitespace-nowrap",
                  col.headerClassName || col.className
                )}
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
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 whitespace-nowrap align-middle",
                      col.className
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default DataTable;
