"use client";

import React from "react";
import { Document } from "@/types/document";
import { FileText, Layers } from "lucide-react";

interface DocumentSelectorProps {
  documents: Document[];
  selectedDocumentId: string;
  onSelectDocument: (id: string) => void;
}

export function DocumentSelector({ documents, selectedDocumentId, onSelectDocument }: DocumentSelectorProps) {
  const readyDocuments = documents.filter((d) => d.status === "READY");

  return (
    <div className="flex items-center gap-2">
      <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Context Scope:</span>
      <select
        value={selectedDocumentId}
        onChange={(e) => onSelectDocument(e.target.value)}
        className="h-8 rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 max-w-[200px] truncate transition-colors"
      >
        <option value="">All Uploaded Documents</option>
        {readyDocuments.map((doc) => (
          <option key={doc.id} value={doc.id}>
            📄 {doc.fileName} ({doc.totalPages}p)
          </option>
        ))}
      </select>
    </div>
  );
}
