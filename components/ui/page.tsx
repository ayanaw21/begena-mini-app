import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Shared layout primitives for the public-facing pages. Every page composes
 * these instead of re-declaring its own container, heading and panel styles.
 */

function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}

function PageBody({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("flex-1 py-8 sm:py-10", className)}
      {...props}
    />
  );
}

type PageHeaderProps = Omit<React.ComponentProps<"header">, "title"> & {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-primary/80 text-xs font-semibold tracking-[0.18em] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-prose text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "bg-surface rounded-xl border border-white/5 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

type PanelHeaderProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

function PanelHeader({
  title,
  description,
  action,
  className,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

type FieldProps = React.ComponentProps<"div"> & {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  required?: boolean;
};

function Field({
  label,
  htmlFor,
  hint,
  required,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium"
      >
        {label}
        {required ? <span className="text-primary">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export { PageContainer, PageBody, PageHeader, Panel, PanelHeader, PanelBody, Field };
