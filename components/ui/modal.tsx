"use client";
import * as React from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { siteImages } from "@/lib/images";
import { cn } from "@/lib/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  image?: import("@/lib/images").SiteImage;
  children?: React.ReactNode;
};

function Modal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  className,
  image,
  children,
}: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "bg-surface relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 shadow-2xl",
          className
        )}
      >
        {/* Photo panel background layer for form modals */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <Image
            src={image || siteImages.adminCloseup || siteImages.authPanel}
            alt=""
            aria-hidden
            fill
            sizes="600px"
            className="object-cover opacity-25"
          />
          <div className="from-surface/85 via-surface/92 to-surface absolute inset-0 bg-gradient-to-b backdrop-blur-xs" />
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          {title ? (
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {description ? (
                  <p className="text-muted-foreground text-sm">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground -mr-1 cursor-pointer rounded-md p-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer ? (
            <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { Modal };
