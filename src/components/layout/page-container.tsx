import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface PageContainerProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ title, description, action, children, className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto max-w-7xl px-8 py-8 space-y-8", className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>}
            {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
