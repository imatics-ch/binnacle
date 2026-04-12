"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-8 h-8 opacity-0" />;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      aria-label="Toggle Theme"
    >
      {currentTheme === "dark" ? (
         <Sun className="w-4 h-4 text-amber-300" />
      ) : (
         <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </button>
  );
}
