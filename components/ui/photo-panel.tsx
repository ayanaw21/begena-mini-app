import * as React from "react";
import Image from "next/image";
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
 * Card panel component with optional atmospheric photo background and high text contrast.
 */
export default function PhotoPanel({
  src,
  sizes = "(max-width: 640px) 100vw, 768px",
  priority = false,
  className,
  contentClassName,
  children,
}: PhotoPanelProps) {
  return (
    <div
      className={cn(
        "bg-surface relative w-full max-w-full min-w-0 rounded-xl border border-white/10 shadow-sm overflow-hidden transition-all",
        className
      )}
    >
      {src ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover opacity-30"
          />
          <div
            aria-hidden
            className="from-surface/80 via-surface/50 to-surface/90 absolute inset-0 bg-gradient-to-b"
          />
        </div>
      ) : null}

      <div className={cn("relative z-10 p-5", contentClassName)}>{children}</div>
    </div>
  );
}
