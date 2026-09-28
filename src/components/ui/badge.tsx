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
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-950/80 text-emerald-400 border-emerald-800/60",
    warning: "bg-amber-950/80 text-amber-400 border-amber-800/60",
    danger: "bg-rose-950/80 text-rose-400 border-rose-800/60",
    info: "bg-indigo-950/80 text-indigo-400 border-indigo-800/60",
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
