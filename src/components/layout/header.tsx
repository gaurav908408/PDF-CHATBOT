import { APP_CONFIG } from "@/config/constants";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-slate-200">{APP_CONFIG.name}</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
          <Sparkles className="h-3 w-3 text-amber-400" />
          Production Pipeline
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>
    </header>
  );
}
