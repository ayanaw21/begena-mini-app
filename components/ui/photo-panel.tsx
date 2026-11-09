import * as React from "react";
import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type PhotoPanelProps = {
  src?: SiteImage;
  sizes?: string;
  priority?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

/**
 * Clean, solid surface card component with consistent border and padding.
 */
export default function PhotoPanel({
  className,
  contentClassName,
  children,
}: PhotoPanelProps) {
  return (
    <div
      className={cn(
        "bg-surface relative w-full max-w-full min-w-0 rounded-xl border border-white/10 shadow-sm transition-colors",
        className
      )}
    >
      <div className={cn("relative p-5", contentClassName)}>{children}</div>
    </div>
  );
}
