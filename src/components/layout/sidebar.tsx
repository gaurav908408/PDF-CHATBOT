"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, MessageSquare, LayoutDashboard, Database, Bot } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navigationItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "RAG Chatbot", href: "/chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6 text-slate-200">
      <div className="flex items-center gap-3 px-3 pb-6 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-wide">PDF RAG Core</h1>
          <p className="text-xs text-slate-400">Enterprise AI Engine</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1.5 flex-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-brand-600/15 text-brand-400 border-l-2 border-brand-500 font-semibold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-brand-400" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-4 px-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Database className="h-4 w-4 text-emerald-400" />
          <span>pgvector Engine Ready</span>
        </div>
      </div>
    </aside>
  );
}
