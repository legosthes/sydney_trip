import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Waves, Sunset, Palette, Leaf, Mountain, Cherry } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

export type Theme = "light" | "dark" | "ocean" | "sunset" | "forest" | "slate" | "sakura";

const themeConfig: { id: Theme; icon: typeof Sun; labelKey: TranslationKey }[] = [
  { id: "light", icon: Sun, labelKey: "theme.light" },
  { id: "dark", icon: Moon, labelKey: "theme.dark" },
  { id: "ocean", icon: Waves, labelKey: "theme.ocean" },
  { id: "sunset", icon: Sunset, labelKey: "theme.sunset" },
  { id: "forest", icon: Leaf, labelKey: "theme.forest" },
  { id: "slate", icon: Mountain, labelKey: "theme.slate" },
  { id: "sakura", icon: Cherry, labelKey: "theme.sakura" },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "theme-ocean", "theme-sunset", "theme-forest", "theme-slate", "theme-sakura");
  if (theme === "dark") root.classList.add("dark");
  else if (theme !== "light") root.classList.add(`theme-${theme}`);
  localStorage.setItem("sydney-theme", theme);
}

export function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("sydney-theme") as Theme) || "light";
  });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = themeConfig.find((tc) => tc.id === theme)!;
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border border-border hover:bg-secondary transition-colors text-foreground"
        title={t(current.labelKey)}
      >
        <Palette className="h-3.5 w-3.5" />
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{t(current.labelKey)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border bg-popover p-1.5 shadow-lg z-50">
          {themeConfig.map((tc) => {
            const TIcon = tc.icon;
            const isActive = theme === tc.id;
            return (
              <button
                key={tc.id}
                onClick={() => { setTheme(tc.id); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <TIcon className="h-4 w-4" />
                <span>{t(tc.labelKey)}</span>
                {isActive && <span className="ml-auto text-primary text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
