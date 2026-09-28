import { APP_CONFIG } from "@/config/constants";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 px-8 backdrop-blur-md transition-colors duration-200">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {APP_CONFIG.name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
