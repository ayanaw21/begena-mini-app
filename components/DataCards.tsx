"use client";
import React from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/page";

export type CardField = {
  label: string;
  value: React.ReactNode;
  /** Render across the full card width instead of in the two-column grid. */
  wide?: boolean;
};

export type DataCardItem = {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  fields?: CardField[];
  actions?: React.ReactNode;
};

type DataCardsProps = {
  items: DataCardItem[];
  emptyTitle?: string;
  emptyDescription?: string;
};

/** Mobile-first alternative to DataTable for records with few columns. */
export default function DataCards({
  items,
  emptyTitle = "Nothing here yet",
  emptyDescription,
}: DataCardsProps) {
  if (items.length === 0) {
    return (
      <Panel>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Panel>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Panel key={item.id} className="flex flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <h3 className="truncate font-semibold">{item.title}</h3>
              {item.subtitle ? (
                <p className="text-muted-foreground truncate text-sm">
                  {item.subtitle}
                </p>
              ) : null}
            </div>
            {item.badge ? <div className="shrink-0">{item.badge}</div> : null}
          </div>

          {item.fields && item.fields.length > 0 ? (
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/5 pt-3">
              {item.fields.map((field) => (
                <div
                  key={field.label}
                  className={`min-w-0 ${field.wide ? "col-span-2" : ""}`}
                >
                  <dt className="text-muted-foreground text-xs">
                    {field.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-sm">{field.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {item.actions ? (
            <div className="mt-4 flex justify-end border-t border-white/5 pt-2">
              {item.actions}
            </div>
          ) : null}
        </Panel>
      ))}
    </div>
  );
}
