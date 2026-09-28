"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSendMessage: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [question, setQuestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!question.trim() || isLoading || disabled) return;
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

  return (
    <div className="relative flex items-end rounded-xl border border-slate-700 bg-slate-900 p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 shadow-lg">
      <textarea
        ref={textareaRef}
        rows={1}
        value={question}
        onChange={handleTextareaInput}
        onKeyDown={handleKeyDown}
        disabled={isLoading || disabled}
        placeholder={disabled ? "Please upload a PDF document first..." : "Ask any question about your PDF document... (Press Enter to send)"}
        className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none disabled:cursor-not-allowed max-h-40"
      />
      <Button
        variant="primary"
        size="sm"
        disabled={!question.trim() || isLoading || disabled}
        onClick={handleSubmit}
        className="h-9 w-9 p-0 shrink-0 mb-0.5"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
}
