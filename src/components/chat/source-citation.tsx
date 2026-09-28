"use client";

import React, { useState } from "react";
import { SourceCitation } from "@/types/chat";
import { safeToFixed } from "@/lib/utils/number";
import { FileText, ChevronDown, ChevronUp, Layers, ExternalLink } from "lucide-react";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-slate-200 dark:border-slate-800/80 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>
          {sources.length} Referenced Source{sources.length > 1 ? "s" : ""}
        </span>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2">
          {sources.map((source, index) => {
            const rawScore = source.similarityScore;
            const formattedPercentage =
              rawScore !== undefined && rawScore !== null
                ? safeToFixed(Number(rawScore) * 100, 1, "")
                : "";

            return (
              <div
                key={source.chunkId || index}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 text-xs space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5 truncate">
                    <ExternalLink className="h-3 w-3 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="truncate">{source.documentName || "PDF Document"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                    <Layers className="h-3 w-3" /> Page {source.pageNumber}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800/60 text-[11px] leading-relaxed">
                  "{source.snippet}"
                </p>
                {formattedPercentage && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                    Match Confidence: {formattedPercentage}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
