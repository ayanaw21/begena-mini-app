import * as React from "react";
import Image from "next/image";

import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

type PhotoPanelProps = {
  src?: SiteImage;
  sizes?: string;
  /** Set on the panel that is the largest painted element on its page. */
  priority?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

/**
 * Panel with a photo behind its own content. The surface colour sits under the
 * image and a scrim over it, so text keeps contrast whatever the photo is.
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
        "bg-surface relative overflow-hidden rounded-xl border border-white/10 shadow-xl",
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          aria-hidden
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover opacity-30"
        />
      ) : null}

      <div
        aria-hidden
        className="from-surface/80 via-surface/45 to-surface/85 absolute inset-0 bg-gradient-to-b"
      />

      <div className={cn("relative p-6", contentClassName)}>{children}</div>
    </div>
  );
}
