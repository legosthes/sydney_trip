import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark";

const STORAGE_KEY = "sydney-theme";
const LEGACY_THEME_CLASSES = [
  "theme-ocean",
  "theme-sunset",
  "theme-forest",
  "theme-slate",
  "theme-neon",
  "theme-brutalist",
  "theme-sakura",
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", ...LEGACY_THEME_CLASSES);
  if (theme === "dark") root.classList.add("dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("theme.light") : t("theme.dark")}
      title={isDark ? t("theme.light") : t("theme.dark")}
      className={cn(
        "relative inline-flex h-8 w-[58px] items-center rounded-full border border-border",
        "bg-secondary/60 transition-colors duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {/* Track icons */}
      <Sun
        className={cn(
          "absolute left-[9px] h-3.5 w-3.5 transition-opacity duration-300",
          isDark ? "opacity-40" : "opacity-100 text-foreground"
        )}
        strokeWidth={1.75}
      />
      <Moon
        className={cn(
          "absolute right-[9px] h-3.5 w-3.5 transition-opacity duration-300",
          isDark ? "opacity-100 text-foreground" : "opacity-40"
        )}
        strokeWidth={1.75}
      />
      {/* Thumb */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 h-[22px] w-[22px] rounded-full bg-card shadow-sm ring-1 ring-border",
          "transition-transform duration-400"
        )}
        style={{
          transitionTimingFunction: "var(--ease-out-quint)",
          transform: isDark ? "translateX(31px)" : "translateX(4px)",
        }}
      />
    </button>
  );
}
