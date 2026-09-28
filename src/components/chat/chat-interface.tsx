"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@/types/chat";
import { Document } from "@/types/document";
import { MessageItem } from "./message-item";
import { ChatInput } from "./chat-input";
import { DocumentSelector } from "./document-selector";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Loader2, Bot, AlertCircle, FileText, Sparkles, UploadCloud, CheckCircle2 } from "lucide-react";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch available documents
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (res.ok && json.success) {
        const docs: Document[] = json.data.documents || [];
        setDocuments(docs);
        if (!selectedDocumentId && docs.length > 0) {
          const readyDoc = docs.find((d) => d.status === "READY") || docs[0];
          setSelectedDocumentId(readyDoc.id);
        }
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  }, [selectedDocumentId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Direct PDF Upload from Chat Bar
  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setUploadNotification(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF files (.pdf) are allowed.");
      return;
    }

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
        throw new Error(json.error?.message || "PDF upload failed.");
      }

      const newDoc: Document = json.data.document;
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocumentId(newDoc.id);
      setUploadNotification(`PDF "${file.name}" uploaded successfully! Text extraction & indexing started.`);

      setTimeout(() => setUploadNotification(null), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error uploading PDF.";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async (question: string) => {
    setErrorMessage(null);

    // Optimistically append user message
    const userMessage: Message = {
      id: "temp-" + Date.now(),
      conversationId: conversationId || "temp",
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversationId: conversationId || undefined,
          documentId: selectedDocumentId || undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to process question.");
      }

      setConversationId(json.data.conversationId);
      setMessages((prev) => [...prev, json.data.message]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred while answering.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId("");
    setMessages([]);
    setErrorMessage(null);
  };

  const activeDoc = documents.find((d) => d.id === selectedDocumentId);

  const suggestionPrompts = [
    "What is the main purpose of this document?",
    "Summarize the key points in bullet format",
    "List all major findings and recommendations",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/20 shadow-lg shadow-brand-500/10">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              ChatGPT PDF Assistant
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" /> pgvector RAG
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Attach a PDF via paperclip 📎 and ask questions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DocumentSelector
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={setSelectedDocumentId}
          />
          <Button variant="outline" size="sm" onClick={handleNewConversation} className="gap-1.5 h-8 text-xs rounded-xl">
            <Plus className="h-3.5 w-3.5" /> New Chat
          </Button>
        </div>
      </div>

      {/* Upload Toast Notification */}
      {uploadNotification && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border-b border-emerald-800/60 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{uploadNotification}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-brand-400 shadow-xl">
              <Bot className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-100">How can I help with your PDF today?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click the <strong>Paperclip 📎 icon</strong> in the chat bar below to attach any PDF document, or pick an existing document from the selector.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="grid grid-cols-1 gap-2 w-full pt-2">
              {suggestionPrompts.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(promptText)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-brand-500/40 text-xs text-slate-300 text-left transition-all group"
                >
                  <span>"{promptText}"</span>
                  <Sparkles className="h-3.5 w-3.5 text-slate-500 group-hover:text-brand-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
            <span>Searching PDF context & generating grounded answer...</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Chat Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40">
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          isUploading={isUploading}
          activeDocName={activeDoc?.fileName}
          activeDocPages={activeDoc?.totalPages}
        />
      </div>
    </div>
  );
}
