import React from "react";
import { Document } from "@/types/document";
import { safeToFixed } from "@/lib/utils/number";
import { FileText, Layers, HardDrive, CheckCircle2 } from "lucide-react";

interface DocumentStatsProps {
  documents: Document[];
}

export function DocumentStats({ documents }: DocumentStatsProps) {
  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === "READY").length;
  const totalPages = documents.reduce((acc, d) => acc + (d.totalPages || 0), 0);
  const totalBytes = documents.reduce((acc, d) => acc + d.fileSize, 0);

  const formatStorage = (bytes: number): string => {
    if (bytes === 0) return "0 MB";
    return safeToFixed(bytes / (1024 * 1024), 1) + " MB";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between shadow-sm transition-colors">
        <div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total PDFs</span>
          <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalDocs}</h4>
        </div>
        <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-800/40">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between shadow-sm transition-colors">
        <div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Ready Contexts</span>
          <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{readyDocs}</h4>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-600/15 dark:text-emerald-400 dark:border-emerald-800/40">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between shadow-sm transition-colors">
        <div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Extracted Pages</span>
          <h4 className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">{totalPages}</h4>
        </div>
        <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-600/15 dark:text-brand-400 dark:border-brand-800/40">
          <Layers className="h-5 w-5" />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between shadow-sm transition-colors">
        <div>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Storage Usage</span>
          <h4 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatStorage(totalBytes)}</h4>
        </div>
        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-600/15 dark:text-amber-400 dark:border-amber-800/40">
          <HardDrive className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
