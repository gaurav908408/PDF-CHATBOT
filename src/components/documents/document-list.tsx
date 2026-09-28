"use client";

import React, { useState } from "react";
import { Document } from "@/types/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentDetailsModal } from "./document-details-modal";
import { FileText, Trash2, Calendar, HardDrive, Layers, RefreshCw, Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DocumentListProps {
  documents: Document[];
  onRefresh?: () => void;
  onDeleteDocument?: (id: string) => void;
}

export function DocumentList({ documents, onRefresh, onDeleteDocument }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="READY">Ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>

          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} className="h-9 text-xs gap-1.5 text-slate-600 dark:text-slate-400 shrink-0">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200">No Documents Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
            {searchQuery || statusFilter !== "ALL"
              ? "No documents match your filter criteria."
              : "Upload a PDF document to start parsing text and building pgvector indexes."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 dark:hover:border-slate-700 transition-all cursor-pointer gap-4 group shadow-sm"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/15 dark:text-brand-400 dark:border-indigo-800/40 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                    {doc.fileName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      {doc.totalPages || 0} Pages
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Badge status={doc.status} />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={deletingId === doc.id}
                  onClick={(e) => handleDelete(e, doc.id)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentDetailsModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onReIndex={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
