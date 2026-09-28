"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Document } from "@/types/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, FileText, Layers, HardDrive, Calendar, Database, Play } from "lucide-react";

interface DocumentDetailsModalProps {
  document: Document | null;
  onClose: () => void;
  onReIndex?: (id: string) => void;
}

export function DocumentDetailsModal({ document, onClose, onReIndex }: DocumentDetailsModalProps) {
  const [isReIndexing, setIsReIndexing] = useState(false);

  const handleReIndex = async () => {
    if (!document) return;
    setIsReIndexing(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/index`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to re-index document.");
      }
      if (onReIndex) onReIndex(document.id);
      alert("Document re-indexed successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Re-indexing error.");
    } finally {
      setIsReIndexing(false);
    }
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-100 truncate">{document.fileName}</h3>
              <p className="text-xs text-slate-400">ID: {document.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Badge status={document.status} />
            </span>
            <span className="font-semibold text-slate-200 block mt-1">Status</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" /> Pages
            </span>
            <span className="font-semibold text-slate-200 block text-sm">{document.totalPages || 0} Pages</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-emerald-400" /> Size
            </span>
            <span className="font-semibold text-slate-200 block text-sm">
              {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> Uploaded
            </span>
            <span className="font-semibold text-slate-200 block text-xs">
              {new Date(document.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {document.errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
            <strong>Failure Details:</strong> {document.errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="h-4 w-4 text-brand-400" />
            <span>pgvector HNSW Index</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="sm" isLoading={isReIndexing} onClick={handleReIndex} className="gap-1.5">
              <Play className="h-3.5 w-3.5" /> Re-Index Vector Chunks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
