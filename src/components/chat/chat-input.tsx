"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader2, Paperclip, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (question: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  isUploading: boolean;
  activeDocName?: string;
  activeDocPages?: number;
}

export function ChatInput({
  onSendMessage,
  onFileUpload,
  isLoading,
  isUploading,
  activeDocName,
  activeDocPages,
}: ChatInputProps) {
  const [question, setQuestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!question.trim() || isLoading) return;
    onSendMessage(question.trim());
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Active PDF Badge above input */}
      {activeDocName && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-brand-500/30 text-xs text-slate-200">
          <FileText className="h-3.5 w-3.5 text-brand-400 shrink-0" />
          <span className="font-medium truncate max-w-[250px]">{activeDocName}</span>
          {activeDocPages !== undefined && (
            <span className="text-[11px] text-slate-400">({activeDocPages} pages)</span>
          )}
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        </div>
      )}

      {/* Main ChatGPT-like Input Bar */}
      <div className="relative flex items-end rounded-2xl border border-slate-700 bg-slate-900 p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-xl">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Paperclip PDF Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
          title="Upload PDF Document"
          className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-xl transition-colors shrink-0 mb-0.5 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={question}
          onChange={handleTextareaInput}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={
            activeDocName
              ? `Ask any question about "${activeDocName}"... (Enter to send)`
              : "Attach a PDF or ask any question... (Press Enter to send)"
          }
          className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed max-h-40"
        />

        {/* Send Button */}
        <Button
          variant="primary"
          size="sm"
          disabled={!question.trim() || isLoading}
          onClick={handleSubmit}
          className="h-9 w-9 p-0 shrink-0 mb-0.5 rounded-xl"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
