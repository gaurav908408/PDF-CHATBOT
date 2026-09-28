"use client";

import React, { useState } from "react";
import { SourceCitation } from "@/types/chat";
import { FileText, ChevronDown, ChevronUp, Layers, ExternalLink } from "lucide-react";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-slate-800/80 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>
          {sources.length} Referenced Source{sources.length > 1 ? "s" : ""}
        </span>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2.5 space-y-2">
          {sources.map((source, index) => (
            <div
              key={source.chunkId || index}
              className="p-3 rounded-lg border border-slate-800 bg-slate-900/80 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between font-medium text-slate-200">
                <span className="flex items-center gap-1.5 truncate">
                  <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{source.documentName || "PDF Document"}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                  <Layers className="h-3 w-3" /> Page {source.pageNumber}
                </span>
              </div>
              <p className="text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/60 text-[11px] leading-relaxed">
                "{source.snippet}"
              </p>
              {source.similarityScore && (
                <div className="text-[10px] text-slate-500 text-right">
                  Match Confidence: {(source.similarityScore * 100).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
