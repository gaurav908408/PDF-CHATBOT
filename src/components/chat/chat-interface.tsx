"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Message, Conversation } from "@/types/chat";
import { Document } from "@/types/document";
import { MessageItem } from "./message-item";
import { ChatInput } from "./chat-input";
import { DocumentSelector } from "./document-selector";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Loader2, Bot, AlertCircle } from "lucide-react";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch available ready documents
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (res.ok && json.success) {
        setDocuments(json.data.documents || []);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">PDF RAG Assistant</h3>
            <p className="text-[11px] text-slate-400">Strictly grounded in uploaded PDF documents</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DocumentSelector
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={setSelectedDocumentId}
          />
          <Button variant="outline" size="sm" onClick={handleNewConversation} className="gap-1.5 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Session
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-brand-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-slate-200">Start a Grounded Conversation</h4>
              <p className="text-xs text-slate-400">
                Ask any question about your uploaded PDF. The assistant will retrieve exact page chunks and generate a grounded answer.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
        )}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
            <span>Searching pgvector database & generating grounded answer...</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
