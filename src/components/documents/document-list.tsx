"use client";

import React, { useState } from "react";
import { Document } from "@/types/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Calendar, HardDrive, Layers, RefreshCw } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  onRefresh?: () => void;
  onDeleteDocument?: (id: string) => void;
}

export function DocumentList({ documents, onRefresh, onDeleteDocument }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document and its chunk vectors?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete document.");
      }

      if (onDeleteDocument) {
        onDeleteDocument(id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting document.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateInput: Date | string): string => {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
        <FileText className="h-12 w-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No Documents Uploaded</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Upload your first PDF document to parse text and store vectors for RAG questioning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Uploaded Documents ({documents.length})
        </span>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8 text-xs gap-1.5 text-slate-400">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh List
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors gap-4"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-indigo-600/15 text-brand-400 border border-indigo-800/40 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h4 className="text-sm font-semibold text-slate-100 truncate">{doc.fileName}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3 text-slate-500" />
                    {formatFileSize(doc.fileSize)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-slate-500" />
                    {doc.totalPages || 0} Pages
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-500" />
                    {formatDate(doc.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <Badge status={doc.status} />
              <Button
                variant="ghost"
                size="sm"
                isLoading={deletingId === doc.id}
                onClick={() => handleDelete(doc.id)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
