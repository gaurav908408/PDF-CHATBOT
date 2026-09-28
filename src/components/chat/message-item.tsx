"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import { SourceCitations } from "./source-citation";
import { Bot, User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-4 p-4 rounded-xl transition-colors",
        isUser ? "bg-slate-900/40 border border-slate-800/60" : "bg-slate-900 border border-slate-800"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-md",
          isUser ? "bg-slate-700" : "bg-brand-600"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? "You" : "RAG Assistant"}
          </span>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitations sources={message.sources} />
        )}
      </div>
    </div>
  );
}
