"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentStats } from "@/components/documents/document-stats";
import { Document } from "@/types/document";
import { Loader2 } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (res.ok && json.success) {
        setDocuments(json.data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents list", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Polling for processing status documents
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "PROCESSING" || d.status === "UPLOADING");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleUploadSuccess = (newDoc: Document) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <PageContainer
      title="Document Repository"
      description="Upload PDF documents, inspect pgvector indexing status, and manage target knowledge contexts"
    >
      <DocumentStats documents={documents} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Document</CardTitle>
              <CardDescription>Select or drop a PDF file to parse, chunk, and embed</CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>All uploaded documents and pgvector indexing statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                  <span className="text-xs">Loading document repository...</span>
                </div>
              ) : (
                <DocumentList
                  documents={documents}
                  onRefresh={fetchDocuments}
                  onDeleteDocument={handleDeleteDocument}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
