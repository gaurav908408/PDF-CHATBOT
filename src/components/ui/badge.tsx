import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { DocumentStatus } from "@/types/document";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  status?: DocumentStatus;
}

export function Badge({ className, variant = "default", status, children, ...props }: BadgeProps) {
  let computedVariant = variant;

  if (status) {
    switch (status) {
      case "READY":
        computedVariant = "success";
        break;
      case "PROCESSING":
      case "UPLOADING":
        computedVariant = "warning";
        break;
      case "FAILED":
        computedVariant = "danger";
        break;
      default:
        computedVariant = "default";
    }
  }

  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/60",
    warning: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800/60",
    danger: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/60",
    info: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-400 dark:border-indigo-800/60",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[computedVariant],
        className
      )}
      {...props}
    >
      {status || children}
    </span>
  );
}
