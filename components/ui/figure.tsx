import * as React from "react";
import Image from "next/image";

import type { SiteImage } from "@/lib/images";
import { cn } from "@/lib/utils";

const ratios = {
  square: "aspect-square",
  wide: "aspect-[16/9]",
  ultrawide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
} as const;

type FigureProps = {
  src?: SiteImage;
  alt: string;
  ratio?: keyof typeof ratios;
  sizes?: string;
  priority?: boolean;
  /** Darkens the lower half so overlaid text stays readable on any photo. */
  scrim?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Image slot that falls back to a themed motif when no artwork is registered,
 * so pages look intentional before the real photos land.
 */
export default function Figure({
  src,
  alt,
  ratio = "wide",
  sizes = "(max-width: 768px) 100vw, 768px",
  priority = false,
  scrim = false,
  className,
  children,
}: FigureProps) {
  return (
    <div
      className={cn(
        "bg-surface relative overflow-hidden rounded-xl border border-white/5",
        ratios[ratio],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          className="object-cover"
        />
      ) : (
        <StringsMotif />
      )}

      {scrim ? (
        <div className="from-background absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      ) : null}

      {children ? (
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Vertical amber lines evoking begena strings. */
function StringsMotif() {
  return (
    <div
      aria-hidden
      className="from-primary/15 via-surface to-background absolute inset-0 bg-gradient-to-br"
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, color-mix(in oklch, var(--primary) 45%, transparent) 0 1px, transparent 1px 11%)",
        }}
      />
      <div className="from-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />
    </div>
  );
}
