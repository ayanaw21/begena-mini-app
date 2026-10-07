"use client";
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
};

export default function RowActions({
  onEdit,
  onDelete,
  children,
}: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {children}
      {onEdit && (
        <Button variant="ghost" size="icon" aria-label="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onClick={onDelete}
          className="hover:text-destructive"
        >
          <Trash2 size={14} />
        </Button>
      )}
    </div>
  );
}
