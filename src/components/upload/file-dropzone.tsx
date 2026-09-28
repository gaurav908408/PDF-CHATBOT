"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/constants";
import { Document } from "@/types/document";

interface FileDropzoneProps {
  onUploadSuccess?: (document: Document) => void;
}

export function FileDropzone({ onUploadSuccess }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client-side quick check
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files are allowed (.pdf).");
      return;
    }

    if (file.size > APP_CONFIG.maxFileSizeBytes) {
      setErrorMessage(`File size exceeds limit of ${APP_CONFIG.maxFileSizeMB}MB.`);
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "File upload failed.");
      }

      setSuccessMessage(`Successfully uploaded "${file.name}". Document processing queued.`);
      if (onUploadSuccess) {
        onUploadSuccess(json.data.document);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred during upload.";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-500/10"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileSelection(e.target.files[0]);
            }
          }}
        />

        <div className="p-4 rounded-full bg-slate-800/80 text-brand-400 mb-4 border border-slate-700">
          {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-100">
            {isUploading ? "Uploading PDF..." : "Click or drag & drop PDF here"}
          </p>
          <p className="text-xs text-slate-400">PDF files up to {APP_CONFIG.maxFileSizeMB}MB max</p>
        </div>

        {!isUploading && (
          <Button variant="outline" size="sm" className="mt-4 gap-2">
            <FileText className="h-4 w-4" /> Browse File
          </Button>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
